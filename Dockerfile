FROM google/cloud-sdk:slim

WORKDIR /app

COPY entrypoint.sh update_billing_roles.sh ./
RUN chmod +x entrypoint.sh update_billing_roles.sh

ENTRYPOINT ["/app/entrypoint.sh"]
