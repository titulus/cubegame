import os
import logging
import httpx
from datetime import datetime
import json
import uuid

logger = logging.getLogger(__name__)

class Analytics:
    def __init__(self):
        self.measurement_id = os.getenv('GA_MEASUREMENT_ID')
        self.api_secret = os.getenv('GA_API_SECRET')
        self.base_url = f"https://www.google-analytics.com/mp/collect"

    async def track_event(self, category: str, action: str, label: str = None, value: int = None):
        try:
            # Создаем уникальный client_id для бота
            client_id = str(uuid.uuid4())
            
            event_params = {
                "event_category": category,
                "platform": "bot"
            }

            if label:
                event_params["user_id"] = label
            if value is not None:
                event_params["value"] = value

            payload = {
                "client_id": client_id,
                "non_personalized_ads": False,
                "events": [{
                    "name": action,
                    "params": event_params
                }]
            }

            url = f"{self.base_url}?measurement_id={self.measurement_id}&api_secret={self.api_secret}"

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                if response.status_code != 204:
                    logger.error(f"Failed to send analytics event: {response.status_code} - {response.text}")
                else:
                    logger.debug(f"Successfully sent analytics event: {action}")
                        
        except Exception as e:
            logger.error(f"Failed to track event: {e}")

    async def validate_config(self):
        """Проверяет правильность конфигурации аналитики"""
        try:
            if not self.measurement_id or not self.api_secret:
                logger.error("Missing GA4 configuration: measurement_id or api_secret not set")
                return False

            # Отправляем тестовое событие
            await self.track_event("system", "config_check", "test")
            return True
        except Exception as e:
            logger.error(f"GA4 configuration validation failed: {e}")
            return False

analytics = Analytics() 