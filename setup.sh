#!/usr/bin/env bash
# ==============================================================================
# billing-role-sync - 初回セットアップ
# ==============================================================================
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "=================================================="
echo " billing-role-sync セットアップ"
echo "=================================================="
echo -e "${NC}"
echo "このスクリプトは .env と terraform.tfvars を生成します。"
echo ""

# [1/5] GCPプロジェクトID
DEFAULT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
echo -e "${YELLOW}[1/5] GCPプロジェクトID${NC}"
if [ -n "$DEFAULT_PROJECT" ]; then
  read -p "プロジェクトID [${DEFAULT_PROJECT}]: " PROJECT_ID
  PROJECT_ID="${PROJECT_ID:-$DEFAULT_PROJECT}"
else
  read -p "プロジェクトID: " PROJECT_ID
  [ -z "$PROJECT_ID" ] && { echo -e "${RED}プロジェクトIDは必須です。${NC}"; exit 1; }
fi

# [2/5] リージョン
echo ""
echo -e "${YELLOW}[2/5] デプロイ先リージョン${NC}"
read -p "リージョン [asia-northeast1]: " REGION
REGION="${REGION:-asia-northeast1}"

# [3/5] 親請求先アカウントID
echo ""
echo -e "${YELLOW}[3/5] 親請求先アカウントID${NC}"
echo "利用可能な請求先アカウント:"
gcloud billing accounts list \
  --format="table(name.basename():label=ACCOUNT_ID, displayName:label=表示名, open:label=有効)" \
  2>/dev/null || echo "(取得できませんでした。手動で入力してください)"
echo ""
read -p "親請求先アカウントID (例: XXXXXX-XXXXXX-XXXXXX): " PARENT_BILLING_ACCOUNT_ID
[ -z "$PARENT_BILLING_ACCOUNT_ID" ] && { echo -e "${RED}親請求先アカウントIDは必須です。${NC}"; exit 1; }

# [4/5] 自社ドメイン
echo ""
echo -e "${YELLOW}[4/5] 自社ドメイン（権限変更の除外対象）${NC}"
echo "複数ドメインはカンマ区切りで指定できます (例: e-agency.co.jp,group-company.co.jp)"
read -p "自社ドメイン: " YOUR_DOMAIN
[ -z "$YOUR_DOMAIN" ] && { echo -e "${RED}自社ドメインは必須です。${NC}"; exit 1; }

# [5/5] TFステートバケット名
echo ""
echo -e "${YELLOW}[5/5] Terraformステートバケット名${NC}"
DEFAULT_BUCKET="${PROJECT_ID}-billing-role-sync-tfstate"
read -p "バケット名 [${DEFAULT_BUCKET}]: " TF_STATE_BUCKET
TF_STATE_BUCKET="${TF_STATE_BUCKET:-$DEFAULT_BUCKET}"

# 確認
echo ""
echo "=================================================="
echo " 設定内容の確認"
echo "=================================================="
echo "  プロジェクトID          : ${PROJECT_ID}"
echo "  リージョン              : ${REGION}"
echo "  親請求先アカウントID    : ${PARENT_BILLING_ACCOUNT_ID}"
echo "  自社ドメイン（除外対象）: ${YOUR_DOMAIN}"
echo "  TFステートバケット名    : ${TF_STATE_BUCKET}"
echo "=================================================="
echo ""
read -p "この内容で設定ファイルを生成しますか？ (yes/no): " CONFIRM
[ "$CONFIRM" != "yes" ] && { echo "キャンセルしました。"; exit 0; }

# ファイル生成
cat > .env <<EOF
PROJECT_ID=${PROJECT_ID}
REGION=${REGION}
TF_STATE_BUCKET=${TF_STATE_BUCKET}
EOF

cat > terraform.tfvars <<EOF
project_id                = "${PROJECT_ID}"
region                    = "${REGION}"
parent_billing_account_id = "${PARENT_BILLING_ACCOUNT_ID}"
your_domain               = "${YOUR_DOMAIN}"
EOF

echo ""
echo -e "${GREEN}=================================================="
echo " セットアップ完了！"
echo "=================================================="
echo -e "${NC}"
echo "次の手順でデプロイしてください:"
echo ""
echo "  1. Terraformの初期化:"
echo "       make init"
echo ""
echo "  2. 初回デプロイ（Artifact Registry作成 → イメージビルド → 全リソース作成）:"
echo "       make init-deploy"
echo ""
echo "  3. 動作確認（Dry-Run）:"
echo "       make run"
echo ""
echo "コマンド一覧:  make help"
