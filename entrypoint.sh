#!/usr/bin/env bash
# update_billing_roles.sh の引数を環境変数から組み立てるエントリーポイント
# スクリプト完了後、生成したログファイルを GCS にアップロードする
set -euo pipefail

ARGS=()

if [[ "${APPLY_MODE:-false}" == "true" ]]; then
  ARGS+=("--apply")
fi

if [[ -n "${TARGET_DOMAINS:-}" ]]; then
  DOMAIN_COUNT=0
  IFS=',' read -ra DOMAINS <<< "${TARGET_DOMAINS}"
  for domain in "${DOMAINS[@]}"; do
    domain="${domain// /}"
    if [[ -n "$domain" ]]; then
      ARGS+=("--target-domain" "$domain")
      DOMAIN_COUNT=$((DOMAIN_COUNT + 1))
    fi
  done

  # 安全ガード: TARGET_DOMAINS を指定しているのに有効なドメインが0件だと、
  # 引数が渡らず「全顧客が対象」に拡大してしまうため中断する（例: " " や "," のみ）
  if [[ ${DOMAIN_COUNT} -eq 0 ]]; then
    echo "[ERROR] TARGET_DOMAINS が指定されていますが、有効なドメインが1件もありません（値: '${TARGET_DOMAINS}'）。" >&2
    echo "[ERROR] 意図せず全顧客が対象になるのを防ぐため中断します。ドメイン指定を確認してください。" >&2
    exit 1
  fi
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
