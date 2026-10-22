FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Run as an unprivileged user. The static/media dirs hold a placeholder file so that a
# new named volume is initialised from the image, including the app user's ownership
# (an empty directory is not copied, and the volume would stay root-owned)
RUN useradd --system --uid 10001 --home-dir /app app \
    && mkdir -p /app/staticfiles /app/media \
    && touch /app/staticfiles/.keep /app/media/.keep \
    && chown -R app:app /app/staticfiles /app/media
USER app

EXPOSE 8000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--access-logfile", "-"]
