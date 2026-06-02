output "cloud_run_job_name" {
  description = "Cloud Run Job名"
  value       = google_cloud_run_v2_job.billing_role_sync.name
}

output "service_account_email" {
  description = "サービスアカウントのメールアドレス"
  value       = google_service_account.billing_role_sync.email
}

output "artifact_registry_url" {
  description = "Artifact Registry URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.billing_role_sync.repository_id}"
}

output "image_url" {
  description = "コンテナイメージURL"
  value       = local.image_url
}

output "log_bucket" {
  description = "ログ保存用 GCS バケット名"
  value       = google_storage_bucket.billing_role_sync_logs.name
}
