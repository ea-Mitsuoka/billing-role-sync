SHELL := /bin/bash
.DEFAULT_GOAL := help

# ==============================================================================
# 設定（make setup 実行後に .env から自動読み込み）
# ==============================================================================
-include .env
export

PROJECT_ID       ?= $(shell gcloud config get-value project 2>/dev/null)
REGION           ?= asia-northeast1
APP_NAME         := billing-role-sync
TF_DIR           := terraform
TF_STATE_BUCKET  ?= $(PROJECT_ID)-billing-role-sync-tfstate
TF_STATE_PREFIX  := billing-role-sync/tfstate
IMAGE_REPO       := $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(APP_NAME)-repo
IMAGE_NAME       := $(IMAGE_REPO)/$(APP_NAME)
IMAGE_TAG        ?= latest
JOB_NAME         := $(APP_NAME)-job
LOG_BUCKET       := $(PROJECT_ID)-billing-role-sync-logs

# ==============================================================================
# ヘルプ
# ==============================================================================
.PHONY: help
help: ## コマンド一覧を表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-22s\033[0m %s\n", $$1, $$2}'

# ==============================================================================
# 初回セットアップ
# ==============================================================================
.PHONY: setup
setup: ## 対話形式でセットアップ（.env と terraform.tfvars を生成）
	@bash setup.sh

# ==============================================================================
# Terraform インフラ管理
# ==============================================================================
.PHONY: _ensure-tf-bucket init plan apply destroy

_ensure-tf-bucket:
	@echo "TFステートバケット確認中: gs://$(TF_STATE_BUCKET)" ; \
	gcloud storage buckets describe gs://$(TF_STATE_BUCKET) --project=$(PROJECT_ID) > /dev/null 2>&1 \
	  || (echo "バケットを作成中..." \
	      && gcloud storage buckets create gs://$(TF_STATE_BUCKET) \
	           --project=$(PROJECT_ID) \
	           --location=$(REGION) \
	           --uniform-bucket-level-access \
	      && echo "バケット作成完了: gs://$(TF_STATE_BUCKET)")

init: _ensure-tf-bucket ## TFステートバケット作成 + terraform init
	terraform -chdir=$(TF_DIR) init \
	  -backend-config="bucket=$(TF_STATE_BUCKET)" \
	  -backend-config="prefix=$(TF_STATE_PREFIX)"

plan: ## terraform plan（変更内容を事前確認）
	terraform -chdir=$(TF_DIR) plan \
	  -var-file="../terraform.tfvars" \
	  -var="image_tag=$(IMAGE_TAG)"

apply: ## terraform apply（インフラ作成・更新）
	terraform -chdir=$(TF_DIR) apply \
	  -var-file="../terraform.tfvars" \
	  -var="image_tag=$(IMAGE_TAG)"

destroy: ## インフラを全削除（APIの無効化は除く）
	terraform -chdir=$(TF_DIR) destroy \
	  -var-file="../terraform.tfvars" \
	  -var="image_tag=$(IMAGE_TAG)"
	@echo ""
	@echo "=========================================="
	@echo "削除完了。APIは無効化されていません。"
	@echo ""
	@echo "TFステートバケットも削除する場合:"
	@echo "  gcloud storage rm -r gs://$(TF_STATE_BUCKET)"
	@echo "=========================================="

# ==============================================================================
# コンテナ管理
# ==============================================================================
.PHONY: _configure-docker build push init-deploy deploy

_configure-docker:
	gcloud auth configure-docker $(REGION)-docker.pkg.dev --quiet

build: ## Dockerイメージをビルド
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

push: _configure-docker build ## Dockerイメージをビルド＆Artifact Registryへプッシュ
	docker push $(IMAGE_NAME):$(IMAGE_TAG)

init-deploy: ## 【初回のみ】Artifact Registry作成 → イメージビルド → 全インフラ作成
	@echo "Step 1/3: Artifact Registryを作成中..."
	terraform -chdir=$(TF_DIR) apply \
	  -target=google_project_service.required_apis \
	  -target=google_artifact_registry_repository.billing_role_sync \
	  -var-file="../terraform.tfvars" \
	  -auto-approve
	@echo ""
	@echo "Step 2/3: Dockerイメージをビルド＆プッシュ中..."
	$(MAKE) --no-print-directory push
	@echo ""
	@echo "Step 3/3: 残りのインフラを作成中..."
	$(MAKE) --no-print-directory apply
	@echo ""
	@echo "=========================================="
	@echo "デプロイ完了！動作確認: make run"
	@echo "=========================================="

deploy: push apply ## イメージ更新＋インフラ更新（2回目以降の更新用）

# ==============================================================================
# ジョブ実行
# ==============================================================================
.PHONY: run run-domain run-apply run-apply-domain logs logs-list

run: ## DRY-RUN: 全顧客の対象ユーザーを確認（変更なし）
	gcloud run jobs execute $(JOB_NAME) \
	  --region=$(REGION) \
	  --project=$(PROJECT_ID) \
	  --update-env-vars="APPLY_MODE=false,TARGET_DOMAINS=" \
	  --wait

run-domain: ## DRY-RUN: ドメイン指定で確認（例: make run-domain DOMAINS=a.com,b.co.jp）
	@[ "$(DOMAINS)" ] || (echo "使い方: make run-domain DOMAINS=a.com,b.co.jp" && exit 1)
	gcloud run jobs execute $(JOB_NAME) \
	  --region=$(REGION) \
	  --project=$(PROJECT_ID) \
	  --update-env-vars="APPLY_MODE=false,TARGET_DOMAINS=$(DOMAINS)" \
	  --wait

run-apply: ## APPLY: 全顧客の権限を実際に変更（確認プロンプトあり）
	@printf "\033[33m==========================================\n 【警告】実際に権限変更を行います\n==========================================\033[0m\n" ; \
	read -p "本当に実行しますか？ (yes/no): " CONFIRM ; \
	if [ "$$CONFIRM" != "yes" ]; then echo "キャンセルしました。"; exit 0; fi ; \
	gcloud run jobs execute $(JOB_NAME) \
	  --region=$(REGION) \
	  --project=$(PROJECT_ID) \
	  --update-env-vars="APPLY_MODE=true,TARGET_DOMAINS=" \
	  --wait

run-apply-domain: ## APPLY: ドメイン指定で実際に変更（例: make run-apply-domain DOMAINS=a.com,b.co.jp）
	@if [ -z "$(DOMAINS)" ]; then echo "使い方: make run-apply-domain DOMAINS=a.com,b.co.jp"; exit 1; fi ; \
	printf "\033[33m==========================================\n 【警告】$(DOMAINS) の権限変更を行います\n==========================================\033[0m\n" ; \
	read -p "本当に実行しますか？ (yes/no): " CONFIRM ; \
	if [ "$$CONFIRM" != "yes" ]; then echo "キャンセルしました。"; exit 0; fi ; \
	gcloud run jobs execute $(JOB_NAME) \
	  --region=$(REGION) \
	  --project=$(PROJECT_ID) \
	  --update-env-vars="APPLY_MODE=true,TARGET_DOMAINS=$(DOMAINS)" \
	  --wait

logs: ## 直近のジョブ実行ログを GCS から取得して表示
	@LATEST=$$(gcloud storage ls gs://$(LOG_BUCKET)/ 2>/dev/null | sort | tail -1) ; \
	if [ -z "$$LATEST" ]; then echo "ログファイルがまだありません。ジョブを実行してください。"; exit 0; fi ; \
	echo "取得中: $$LATEST" ; \
	echo "" ; \
	gcloud storage cat "$$LATEST"

logs-list: ## GCS に保存されたログファイル一覧を表示
	@gcloud storage ls gs://$(LOG_BUCKET)/ 2>/dev/null \
	  || echo "ログファイルがまだありません。ジョブを実行してください。"
