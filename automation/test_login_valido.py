import os
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

BASE_URL = os.getenv("MEDICLOUD_URL", "http://localhost:5173")
TEST_EMAIL = os.getenv("TEST_EMAIL", "admin@medicloud.com")
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "123456")
TIMEOUT = int(os.getenv("SELENIUM_TIMEOUT", "10"))


class TestLoginValido:

    def test_login_valido_redirige_a_dashboard(self, driver):
        try:
            driver.get(f"{BASE_URL}/login")
            WebDriverWait(driver, TIMEOUT).until(
                EC.presence_of_element_located((By.ID, "email"))
            )

            email_input = driver.find_element(By.ID, "email")
            password_input = driver.find_element(By.ID, "password")
            submit_btn = driver.find_element(
                By.CSS_SELECTOR, "button.btn.btn-primary"
            )

            email_input.send_keys(TEST_EMAIL)
            password_input.send_keys(TEST_PASSWORD)
            submit_btn.click()

            WebDriverWait(driver, TIMEOUT).until(
                EC.url_to_be(f"{BASE_URL}/dashboard")
            )
            assert driver.current_url == f"{BASE_URL}/dashboard", (
                f"Esperada {BASE_URL}/dashboard, obtenida {driver.current_url}"
            )

        except TimeoutException:
            pytest.fail(
                f"Timeout esperando elemento o redirección. "
                f"URL actual: {driver.current_url}"
            )
        except AssertionError as e:
            pytest.fail(f"Fallo de aserción: {e}")
        except Exception as e:
            pytest.fail(f"Error inesperado durante el test: {e}")

    def test_dashboard_muestra_contenido_esperado(self, driver):
        try:
            driver.get(f"{BASE_URL}/login")
            WebDriverWait(driver, TIMEOUT).until(
                EC.presence_of_element_located((By.ID, "email"))
            )

            driver.find_element(By.ID, "email").send_keys(TEST_EMAIL)
            driver.find_element(By.ID, "password").send_keys(TEST_PASSWORD)
            driver.find_element(
                By.CSS_SELECTOR, "button.btn.btn-primary"
            ).click()

            WebDriverWait(driver, TIMEOUT).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, ".dashboard-page h1")
                )
            )

            heading = driver.find_element(
                By.CSS_SELECTOR, ".dashboard-page h1"
            )
            assert heading.is_displayed(), "El título del dashboard no está visible"
            assert heading.text.strip() == "Dashboard", (
                f"Texto del título: '{heading.text.strip()}'"
            )

            stat_cards = driver.find_elements(
                By.CSS_SELECTOR, ".dashboard-card"
            )
            assert len(stat_cards) > 0, (
                "No se encontraron tarjetas de estadísticas en el dashboard"
            )

        except TimeoutException:
            pytest.fail(
                f"Timeout esperando contenido del dashboard. "
                f"URL actual: {driver.current_url}"
            )
        except AssertionError as e:
            pytest.fail(f"Fallo de aserción: {e}")
        except Exception as e:
            pytest.fail(f"Error inesperado en test de contenido: {e}")

    def test_sesion_activa_tras_recargar(self, driver):
        try:
            driver.get(f"{BASE_URL}/login")
            WebDriverWait(driver, TIMEOUT).until(
                EC.presence_of_element_located((By.ID, "email"))
            )

            driver.find_element(By.ID, "email").send_keys(TEST_EMAIL)
            driver.find_element(By.ID, "password").send_keys(TEST_PASSWORD)
            driver.find_element(
                By.CSS_SELECTOR, "button.btn.btn-primary"
            ).click()

            WebDriverWait(driver, TIMEOUT).until(
                EC.url_to_be(f"{BASE_URL}/dashboard")
            )

            driver.get(f"{BASE_URL}/dashboard")

            WebDriverWait(driver, TIMEOUT).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, ".dashboard-page h1")
                )
            )

            assert driver.current_url == f"{BASE_URL}/dashboard", (
                f"URL después de recargar: {driver.current_url}"
            )
            assert driver.find_element(
                By.CSS_SELECTOR, ".dashboard-page h1"
            ).is_displayed()

        except TimeoutException:
            pytest.fail(
                f"Timeout verificando sesión activa tras recarga. "
                f"URL actual: {driver.current_url}"
            )
        except AssertionError as e:
            pytest.fail(f"Fallo de aserción en test de sesión: {e}")
        except Exception as e:
            pytest.fail(f"Error inesperado en test de sesión: {e}")
