---
title: Face Track API Backend
emoji: 🚀
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 8000
pinned: false
---

# FaceTrack Attendance System - Backend API

This repository hosts the Python FastAPI + InsightFace backend for the AI Face Recognition Employee Attendance System.

## Deployment on Hugging Face Spaces

1. Create a new **Space** on Hugging Face: [huggingface.co/spaces](https://huggingface.co/spaces)
2. Choose **Docker** as the SDK.
3. Select the **Blank** template.
4. Upload all files from your `backend` directory (including `Dockerfile` and `README.md`).
5. Set your **Environment Variables** in Hugging Face Space settings:
   * `DATABASE_URL` (Supabase Postgres URI string)
   * `SUPABASE_URL`
   * `SUPABASE_ANON_KEY`
   * `JWT_SECRET`
   * `SMTP_USERNAME` (Gmail app sender address)
   * `SMTP_PASSWORD` (Gmail SMTP App password)
