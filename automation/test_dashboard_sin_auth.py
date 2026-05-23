import os
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

BASE_URL = os.getenv("MEDICLOUD_URL", "http://localhost:5173")
TIMEOUT = int(os.getenv("SELENIUM_TIMEOUT", "10"))


class TestDashboardSinAuth:

    def test_redireccion_login_sin_autenticacion(self, driver):
        try:
            driver.get(f"{BASE_URL}/dashboard")

            WebDriverWait(driver, TIMEOUT).until(
                EC.url_to_be(f"{BASE_URL}/login")
            )

            assert driver.current_url == f"{BASE_URL}/login", (
                f"Esperada {BASE_URL}/login, obtenida {driver.current_url}"
            )

        except TimeoutException:
            pytest.fail(
                f"No se redirigió a login. URL actual: {driver.current_url}"
            )
        except AssertionError as e:
            pytest.fail(f"Fallo de aserción: {e}")
        except Exception as e:
            pytest.fail(f"Error inesperado: {e}")

    def test_muestra_formulario_login_tras_redireccion(self, driver):
        try:
            driver.get(f"{BASE_URL}/dashboard")

            WebDriverWait(driver, TIMEOUT).until(
                EC.presence_of_element_located((By.ID, "email"))
            )

            assert driver.find_element(By.ID, "email").is_displayed()
            assert driver.find_element(By.ID, "password").is_displayed()
            assert driver.find_element(
                By.CSS_SELECTOR, "button.btn.btn-primary"
            ).is_displayed()

            assert "MediCloud" in driver.page_source
            assert "Inicia sesión para continuar" in driver.page_source

        except TimeoutException:
            pytest.fail(
                f"No se mostró el formulario de login. URL: {driver.current_url}"
            )
        except AssertionError as e:
            pytest.fail(f"Fallo de aserción: {e}")
        except Exception as e:
            pytest.fail(f"Error inesperado: {e}")

    def test_ruta_protegida_devuelve_401_sin_token(self, driver):
        try:
            driver.get(f"{BASE_URL}")
            WebDriverWait(driver, TIMEOUT).until(
                EC.url_to_be(f"{BASE_URL}/login")
            )

            driver.execute_script(
                "window.localStorage.removeItem('medicloud_token');"
            )
            driver.execute_script(
                "window.localStorage.removeItem('medicloud_user');"
            )

            driver.get(f"{BASE_URL}/dashboard")
            WebDriverWait(driver, TIMEOUT).until(
                EC.url_to_be(f"{BASE_URL}/login")
            )

            assert "/dashboard" not in driver.current_url
            assert driver.current_url == f"{BASE_URL}/login"

        except TimeoutException:
            pytest.fail(
                f"No se redirigió a login tras limpiar sesión. "
                f"URL: {driver.current_url}"
            )
        except AssertionError as e:
            pytest.fail(f"Fallo de aserción: {e}")
        except Exception as e:
            pytest.fail(f"Error inesperado: {e}")
