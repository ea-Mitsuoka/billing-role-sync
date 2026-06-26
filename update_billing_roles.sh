#!/usr/bin/env bash
# ==============================================================================
# billing-role-sync - 請求先サブアカウント IAM権限同期スクリプト
# ==============================================================================
# 安全のため、未定義変数の参照やパイプラインのエラーを検知して停止します
set -euo pipefail

# ==========================================
# 設定項目 (環境変数での上書きを許容)
# ==========================================
PARENT_ACCOUNT_ID="${PARENT_ACCOUNT_ID:-XXXXXX-XXXXXX-XXXXXX}"
# カンマ区切りで複数ドメインを指定可能 (例: e-agency.co.jp,group-company.co.jp)
YOUR_DOMAIN="${YOUR_DOMAIN:-your-company.co.jp}"

# ログファイルの設定
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="billing_role_update_log_${TIMESTAMP}.txt"

# ログ出力用関数
log_info() { echo -e "[INFO] $(date +'%Y-%m-%d %H:%M:%S') $*"; }
log_warn() { echo -e "\e[33m[WARN] $(date +'%Y-%m-%d %H:%M:%S') $*\e[0m"; }
log_err()  { echo -e "\e[31m[ERROR] $(date +'%Y-%m-%d %H:%M:%S') $*\e[0m"; }

# ==========================================
# 引数の解析
# ==========================================
DRY_RUN=true
TARGET_DOMAINS=()

usage() {
  cat <<EOF
使い方: $0 [OPTIONS]

OPTIONS:
  --apply                       実際の権限変更を実行する (省略時はDry-Run)
  --target-domain <domain>      処理対象の顧客ドメインを指定する (複数回指定可能)
                                省略時は自社ドメイン以外の全ユーザーが対象

例:
  # Dry-Runで全顧客を対象に確認
  $0

  # 特定ドメインのみDry-Run確認
  $0 --target-domain customer-a.com

  # 複数ドメインを対象に実際に変更
  $0 --target-domain customer-a.com --target-domain customer-b.co.jp --apply
EOF
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply)
      DRY_RUN=false
      shift
      ;;
    --target-domain)
      if [[ -z "${2:-}" ]]; then
        log_err "--target-domain にドメイン名を指定してください。"
        usage
      fi
      TARGET_DOMAINS+=("$2")
      shift 2
      ;;
    --target-domain=*)
      TARGET_DOMAINS+=("${1#--target-domain=}")
      shift
      ;;
    --help|-h)
      usage
      ;;
    *)
      log_err "不明なオプション: $1"
      usage
      ;;
  esac
done

# ==========================================
# 対象ドメインチェック用の関数
# TARGET_DOMAINS が空の場合は全外部ユーザーを対象とする
# ==========================================
is_target_domain() {
  local member="$1"
  if [[ ${#TARGET_DOMAINS[@]} -eq 0 ]]; then
    return 0
  fi
  for domain in "${TARGET_DOMAINS[@]}"; do
    if [[ "${member}" == *@${domain} ]]; then
      return 0
    fi
  done
  return 1
}

# ==========================================
# メイン処理ブロック (出力をteeに流し込む)
# ==========================================
{
  echo "=================================================="
  log_info "処理開始"
  log_info "実行者             : ${INVOKED_BY:-不明}"
  log_info "実行ID             : ${CLOUD_RUN_EXECUTION:-N/A (ローカル実行)}"
  log_info "親請求先アカウント : ${PARENT_ACCOUNT_ID}"
  log_info "除外対象ドメイン   : ${YOUR_DOMAIN}"

  if [[ ${#TARGET_DOMAINS[@]} -gt 0 ]]; then
    log_info "対象顧客ドメイン   : ${TARGET_DOMAINS[*]}"
  else
    log_info "対象顧客ドメイン   : (指定なし - 全外部ユーザーが対象)"
  fi

  if ${DRY_RUN}; then
    echo "--------------------------------------------------"
    log_warn "【DRY-RUN MODE】実際の権限変更は行われません。"
    log_warn "本番実行する場合は '--apply' 引数を付けて実行してください。"
    echo "--------------------------------------------------"
  else
    log_warn "【APPLY MODE】実際の権限変更を実行します。"
  fi
  echo "=================================================="

  # 安全ガード: 除外対象ドメイン(YOUR_DOMAIN)が未設定/既定プレースホルダのままだと
  # 自社運用者の権限まで剥奪してしまうため、APPLY時は中断する（DRY-RUNは警告のみ）
  if [[ -z "${YOUR_DOMAIN// /}" || "${YOUR_DOMAIN}" == "your-company.co.jp" ]]; then
    if ${DRY_RUN}; then
      log_warn "YOUR_DOMAIN が未設定（または既定値）です。除外対象が機能せず、自社運用者も対象として表示されます。"
    else
      log_err "YOUR_DOMAIN が未設定（または既定値 'your-company.co.jp'）のため中断します。"
      log_err "除外対象ドメインを指定して再実行してください（例: YOUR_DOMAIN=your-domain.co.jp）。"
      exit 1
    fi
  fi

  log_info "サブアカウント一覧を取得中..."
  # gcloudコマンドのエラーハンドリング
  if ! SUB_ACCOUNTS=$(gcloud billing accounts list --filter="masterBillingAccount=billingAccounts/${PARENT_ACCOUNT_ID}" --format="value(name)" | awk -F'/' '{print $NF}'); then
    log_err "サブアカウント一覧の取得に失敗しました。権限やアカウントIDを確認してください。"
    exit 1
  fi

  if [[ -z "${SUB_ACCOUNTS}" ]]; then
    log_warn "対象のサブアカウントが見つかりませんでした。"
    exit 0
  fi

  for ACCOUNT_ID in ${SUB_ACCOUNTS}; do
    echo "--------------------------------------------------"
    log_info "サブアカウント [${ACCOUNT_ID}] を確認中..."

    if ! ADMIN_MEMBERS=$(gcloud beta billing accounts get-iam-policy "${ACCOUNT_ID}" \
      --flatten="bindings[].members" \
      --filter="bindings.role:roles/billing.admin" \
      --format="value(bindings.members)"); then
      log_err "[${ACCOUNT_ID}] IAMポリシーの取得に失敗しました。スキップします。"
      continue
    fi

    for MEMBER in ${ADMIN_MEMBERS}; do
      # user: プレフィックス以外は除外
      if [[ "${MEMBER}" != user:* ]]; then
        continue
      fi
      # 自社ドメイン（カンマ区切りで複数指定可）は除外
      IS_OWN_DOMAIN=false
      IFS=',' read -ra OWN_DOMAINS <<< "${YOUR_DOMAIN}"
      for OWN in "${OWN_DOMAINS[@]}"; do
        OWN="${OWN// /}"  # 前後の空白を除去
        if [[ "${MEMBER}" == *@${OWN} ]]; then
          IS_OWN_DOMAIN=true
          break
        fi
      done
      if ${IS_OWN_DOMAIN}; then
        continue
      fi

      # 対象ドメインフィルタ
      if ! is_target_domain "${MEMBER}"; then
        log_info "対象外ドメインのためスキップ: ${MEMBER}"
        continue
      fi

      log_info "対象ユーザー検出: ${MEMBER}"

      if ${DRY_RUN}; then
        echo "    (予定) + roles/billing.user"
        echo "    (予定) + roles/billing.viewer"
        echo "    (予定) + roles/billing.costsManager"
        echo "    (予定) - roles/billing.admin"
      else
        # エラーが起きてもスクリプトを止めず、ログに記録する
        echo "    -> roles/billing.user を付与中..."
        gcloud beta billing accounts add-iam-policy-binding "${ACCOUNT_ID}" --member="${MEMBER}" --role="roles/billing.user" --quiet > /dev/null || log_err "${MEMBER} への roles/billing.user 付与失敗"

        echo "    -> roles/billing.viewer を付与中..."
        gcloud beta billing accounts add-iam-policy-binding "${ACCOUNT_ID}" --member="${MEMBER}" --role="roles/billing.viewer" --quiet > /dev/null || log_err "${MEMBER} への roles/billing.viewer 付与失敗"

        echo "    -> roles/billing.costsManager を付与中..."
        gcloud beta billing accounts add-iam-policy-binding "${ACCOUNT_ID}" --member="${MEMBER}" --role="roles/billing.costsManager" --quiet > /dev/null || log_err "${MEMBER} への roles/billing.costsManager 付与失敗"

        echo "    -> roles/billing.admin を剥奪中..."
        gcloud beta billing accounts remove-iam-policy-binding "${ACCOUNT_ID}" --member="${MEMBER}" --role="roles/billing.admin" --quiet > /dev/null || log_err "${MEMBER} からの roles/billing.admin 剥奪失敗"

        log_info "[${ACCOUNT_ID}] ${MEMBER} のロール更新が完了しました。"
      fi
    done
  done

  echo "--------------------------------------------------"
  log_info "処理終了"
} 2>&1 | tee "${LOG_FILE}"

echo "=================================================="
echo "ログは現在のディレクトリの ${LOG_FILE} に保存されました。"
