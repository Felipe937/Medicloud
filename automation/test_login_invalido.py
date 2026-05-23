import os
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

BASE_URL = os.getenv("MEDICLOUD_URL", "http://localhost:5173")
WRONG_EMAIL = os.getenv("TEST_WRONG_EMAIL", "invalido@correo.com")
WRONG_PASSWORD = os.getenv("TEST_WRONG_PASSWORD", "contraseña_incorrecta")
TIMEOUT = int(os.getenv("SELENIUM_TIMEOUT", "10"))

class TestLoginInvalido:

    def test_login_incorrecto_muestra_error(self, driver):
        try:
            driver.get(f"{BASE_URL}/login")
            WebDriverWait(driver, TIMEOUT).until(
                EC.presence_of_element_located((By.ID, "email"))
            )

            driver.find_element(By.ID, "email").send_keys(WRONG_EMAIL)
            driver.find_element(By.ID, "password").send_keys(WRONG_PASSWORD)
            driver.find_element(
                By.CSS_SELECTOR, "button.btn.btn-primary"
            ).click()

            error_div = WebDriverWait(driver, TIMEOUT).until(
                EC.visibility_of_element_located(
                    (By.XPATH, "//*[contains(text(), 'Credenciales inválidas')]")
                )
            )

            assert error_div.text == "Credenciales inválidas.", (
                f"Texto del error: '{error_div.text}'"
            )

        except TimeoutException:
            pytest.fail(
                f"No apareció el mensaje de error. "
                f"URL actual: {driver.current_url}"
            )
        except AssertionError as e:
            pytest.fail(f"Fallo de aserción: {e}")
        except Exception as e:
            pytest.fail(f"Error inesperado: {e}")

    def test_permanencia_en_login_tras_error(self, driver):
        try:
            driver.get(f"{BASE_URL}/login")
            WebDriverWait(driver, TIMEOUT).until(
                EC.presence_of_element_located((By.ID, "email"))
            )

            driver.find_element(By.ID, "email").send_keys(WRONG_EMAIL)
            driver.find_element(By.ID, "password").send_keys(WRONG_PASSWORD)
            driver.find_element(
                By.CSS_SELECTOR, "button.btn.btn-primary"
            ).click()

            WebDriverWait(driver, TIMEOUT).until(
                EC.visibility_of_element_located(
                    (By.XPATH, "//*[contains(text(), 'Credenciales inválidas')]")
                )
            )

            current_url = driver.current_url
            assert "/dashboard" not in current_url, (
                f"Fue redirigido a dashboard a pesar del error: {current_url}"
            )
            assert "/login" in current_url, (
                f"URL actual inesperada tras error: {current_url}"
            )

            email_input = driver.find_element(By.ID, "email")
            password_input = driver.find_element(By.ID, "password")
            submit_btn = driver.find_element(
                By.CSS_SELECTOR, "button.btn.btn-primary"
            )

            assert email_input.is_displayed(), "El campo email no está visible"
            assert password_input.is_displayed(), "El campo password no está visible"
            assert submit_btn.is_displayed(), "El botón submit no está visible"
            assert submit_btn.is_enabled(), "El botón debería estar habilitado tras el error"

        except TimeoutException:
            pytest.fail(
                f"Timeout verificando permanencia en login. "
                f"URL actual: {driver.current_url}"
            )
        except AssertionError as e:
            pytest.fail(f"Fallo de aserción: {e}")
        except Exception as e:
            pytest.fail(f"Error inesperado: {e}")

    def test_multiples_intentos_fallidos(self, driver):
        try:
            driver.get(f"{BASE_URL}/login")

            for intento in range(3):
                WebDriverWait(driver, TIMEOUT).until(
                    EC.presence_of_element_located((By.ID, "email"))
                )

                email_input = driver.find_element(By.ID, "email")
                password_input = driver.find_element(By.ID, "password")

                email_input.clear()
                password_input.clear()
                email_input.send_keys(WRONG_EMAIL)
                password_input.send_keys(WRONG_PASSWORD)

                driver.find_element(
                    By.CSS_SELECTOR, "button.btn.btn-primary"
                ).click()

                WebDriverWait(driver, TIMEOUT).until(
                    EC.visibility_of_element_located(
                        (By.XPATH,
                         "//*[contains(text(), 'Credenciales inválidas')]")
                    )
                )

                assert "/login" in driver.current_url, (
                    f"Intento {intento + 1}: redirigió a {driver.current_url}"
                )

                error_elements = driver.find_elements(
                    By.XPATH,
                    "//*[contains(text(), 'Credenciales inválidas')]"
                )
                assert len(error_elements) > 0, (
                    f"Intento {intento + 1}: error no visible"
                )

        except TimeoutException:
            pytest.fail(
                f"Timeout en intento {intento + 1}. "
                f"URL: {driver.current_url}"
            )
        except AssertionError as e:
            pytest.fail(f"Fallo de aserción: {e}")
        except Exception as e:
            pytest.fail(f"Error inesperado en intentos múltiples: {e}")
