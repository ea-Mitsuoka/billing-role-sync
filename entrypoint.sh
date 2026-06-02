#!/usr/bin/env bash
# update_billing_roles.sh の引数を環境変数から組み立てるエントリーポイント
# スクリプト完了後、生成したログファイルを GCS にアップロードする
set -euo pipefail

ARGS=()

if [[ "${APPLY_MODE:-false}" == "true" ]]; then
  ARGS+=("--apply")
fi

if [[ -n "${TARGET_DOMAINS:-}" ]]; then
  IFS=',' read -ra DOMAINS <<< "${TARGET_DOMAINS}"
  for domain in "${DOMAINS[@]}"; do
    domain="${domain// /}"
    [[ -n "$domain" ]] && ARGS+=("--target-domain" "$domain")
  done
fi

# スクリプト実行（失敗してもログアップロードを試みるため exit code を保持）
EXIT_CODE=0
/app/update_billing_roles.sh "${ARGS[@]}" || EXIT_CODE=$?

# GCS へログをアップロード
if [[ -n "${LOG_BUCKET:-}" ]]; then
  LOG_FILE=$(ls billing_role_update_log_*.txt 2>/dev/null | head -1 || true)
  if [[ -n "$LOG_FILE" ]]; then
    echo "ログを GCS にアップロード中: gs://${LOG_BUCKET}/${LOG_FILE}"
    gsutil cp "$LOG_FILE" "gs://${LOG_BUCKET}/${LOG_FILE}" \
      && echo "アップロード完了: gs://${LOG_BUCKET}/${LOG_FILE}" \
      || echo "[WARN] ログのアップロードに失敗しました。Cloud Logging を確認してください。"
  fi
fi

exit $EXIT_CODE
