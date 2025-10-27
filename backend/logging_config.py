"""
Configuration for structured JSON logging.
"""
import logging
import sys
import uuid

from pythonjsonlogger import jsonlogger

class RequestIdFilter(logging.Filter):
    """
    A logging filter that injects a unique request ID into the log record.
    If the request ID is not set, a new one is generated.
    """
    def filter(self, record):
        if not hasattr(record, 'request_id'):
            record.request_id = str(uuid.uuid4())
        return True


def setup_logging():
    """Sets up structured JSON logging."""
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Prevent duplicate logs if already configured
    if logger.hasHandlers():
        logger.handlers.clear()

    log_handler = logging.StreamHandler(sys.stdout)
    formatter = jsonlogger.JsonFormatter(
        '%(asctime)s %(name)s %(levelname)s %(request_id)s %(message)s'
    )
    log_handler.setFormatter(formatter)
    log_handler.addFilter(RequestIdFilter())
    logger.addHandler(log_handler)