FROM google/cloud-sdk:slim

# beta コンポーネントをインストール（gcloud beta billing コマンドに必要）
RUN gcloud components install beta --quiet

WORKDIR /app

COPY entrypoint.sh update_billing_roles.sh ./
RUN chmod +x entrypoint.sh update_billing_roles.sh

ENTRYPOINT ["/app/entrypoint.sh"]
