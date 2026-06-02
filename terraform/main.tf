locals {
  app_name   = "billing-role-sync"
  image_url  = "${var.region}-docker.pkg.dev/${var.project_id}/${local.app_name}-repo/${local.app_name}:${var.image_tag}"
  log_bucket = "${var.project_id}-${local.app_name}-logs"
}

data "google_project" "project" {
  project_id = var.project_id
}

# ==============================================================================
# API有効化
# disable_on_destroy = false: 他アプリも同プロジェクトにデプロイされているため
# destroy時にAPIを無効化しない
# ==============================================================================
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "iam.googleapis.com",
    "storage.googleapis.com",
  ])

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# Cloud Build が使用する Compute Engine デフォルト SA への権限付与
# 新規 GCP プロジェクトでは cloudbuild.builds.builder を手動で付与する必要がある
resource "google_project_iam_member" "compute_sa_cloudbuild" {
  project = var.project_id
  role    = "roles/cloudbuild.builds.builder"
  member  = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"

  depends_on = [google_project_service.required_apis]
}

# ==============================================================================
# サービスアカウント
# ==============================================================================
resource "google_service_account" "billing_role_sync" {
  project      = var.project_id
  account_id   = "${local.app_name}-sa"
  display_name = "Billing Role Sync SA"
  description  = "Cloud Run Job用 請求先IAM権限同期ツール サービスアカウント"
}

# 親請求先アカウントへの billing.admin 権限付与
resource "google_billing_account_iam_member" "billing_role_sync_admin" {
  billing_account_id = var.parent_billing_account_id
  role               = "roles/billing.admin"
  member             = "serviceAccount:${google_service_account.billing_role_sync.email}"
}

# ==============================================================================
# ログ保存用 GCS バケット
# ==============================================================================
resource "google_storage_bucket" "billing_role_sync_logs" {
  project                     = var.project_id
  name                        = local.log_bucket
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = true  # make destroy で確実に削除できるよう設定

  lifecycle_rule {
    action { type = "Delete" }
    condition { age = 365 }
  }

  depends_on = [google_project_service.required_apis]
}

# サービスアカウントにバケットへの書き込み権限を付与
resource "google_storage_bucket_iam_member" "billing_role_sync_logs_writer" {
  bucket = google_storage_bucket.billing_role_sync_logs.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.billing_role_sync.email}"
}

# ==============================================================================
# Artifact Registry
# ==============================================================================
resource "google_artifact_registry_repository" "billing_role_sync" {
  project       = var.project_id
  location      = var.region
  repository_id = "${local.app_name}-repo"
  description   = "請求先IAM権限同期ツール コンテナリポジトリ"
  format        = "DOCKER"

  depends_on = [google_project_service.required_apis]
}

# ==============================================================================
# Cloud Run Job
# ==============================================================================
resource "google_cloud_run_v2_job" "billing_role_sync" {
  project  = var.project_id
  name     = "${local.app_name}-job"
  location = var.region

  template {
    template {
      service_account = google_service_account.billing_role_sync.email
      max_retries     = 0
      timeout         = "3600s"

      containers {
        image = local.image_url

        env {
          name  = "PARENT_ACCOUNT_ID"
          value = var.parent_billing_account_id
        }
        env {
          name  = "YOUR_DOMAIN"
          value = var.your_domain
        }
        env {
          name  = "LOG_BUCKET"
          value = local.log_bucket
        }
        # 実行時に --update-env-vars で上書き可能なデフォルト値
        env {
          name  = "APPLY_MODE"
          value = "false"
        }
        env {
          name  = "TARGET_DOMAINS"
          value = ""
        }
      }
    }
  }

  depends_on = [
    google_project_service.required_apis,
    google_artifact_registry_repository.billing_role_sync,
    google_storage_bucket.billing_role_sync_logs,
  ]
}
