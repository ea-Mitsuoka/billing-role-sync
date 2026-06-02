FROM google/cloud-sdk:slim

# apt 経由で beta コンポーネントをインストール（slim イメージは component manager 無効のため）
RUN apt-get update -y && apt-get install -y google-cloud-cli-beta && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY entrypoint.sh update_billing_roles.sh ./
RUN chmod +x entrypoint.sh update_billing_roles.sh

ENTRYPOINT ["/app/entrypoint.sh"]
