window.addEventListener("pageshow", function () {
    const accessToken = sessionStorage.getItem("accessToken");
    const currentPath = window.location.pathname;

    if (
        accessToken &&
        (currentPath === "/login/" || currentPath === "/register/")
    ) {
        window.location.replace("/dashboard/");
    }
});

// Registration form handling
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm_password");

    const message = document.getElementById("message");
    const registerButton = document.getElementById("registerButton");

    // Display an error below a field.
    function showError(input, errorId, errorText) {
        const errorElement = document.getElementById(errorId);

        errorElement.textContent = errorText;
        input.classList.toggle("is-invalid", Boolean(errorText));
        input.classList.toggle("is-valid", !errorText && input.value.length > 0);
    }

    function clearFieldError(input, errorId) {
        showError(input, errorId, "");
    }

    // Validate username while typing.
    function validateUsername() {
        const value = username.value.trim();

        if (!value) {
            showError(username, "usernameError", "Username is required.");
            return false;
        }

        if (value.length < 3) {
            showError(
                username,
                "usernameError",
                "Username must contain at least 3 characters."
            );
            return false;
        }

        if (value.length > 150) {
            showError(
                username,
                "usernameError",
                "Username cannot exceed 150 characters."
            );
            return false;
        }

        // Django's default username characters:
        // letters, numbers, underscore, @, dot, + and -
        if (!/^[\w.@+-]+$/u.test(value)) {
            showError(
                username,
                "usernameError",
                "Use only letters, numbers, and these symbols: @ . + - _"
            );
            return false;
        }

        clearFieldError(username, "usernameError");
        return true;
    }

    function validateEmail() {
        const value = email.value.trim();

        if (!value) {
            showError(email, "emailError", "Email is required.");
            return false;
        }

        // Basic email format check.
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            showError(
                email,
                "emailError",
                "Please enter a valid email address."
            );
            return false;
        }

        clearFieldError(email, "emailError");
        return true;
    }

    function validatePassword() {
        const value = password.value;

        if (!value) {
            showError(password, "passwordError", "Password is required.");
            return false;
        }

        if (value.length < 8) {
            showError(
                password,
                "passwordError",
                "Password must contain at least 8 characters."
            );
            return false;
        }

        clearFieldError(password, "passwordError");

        // Changing the password may invalidate confirmation.
        if (confirmPassword.value) {
            validateConfirmPassword();
        }

        return true;
    }

    function validateConfirmPassword() {
        if (!confirmPassword.value) {
            showError(
                confirmPassword,
                "confirmPasswordError",
                "Please confirm your password."
            );
            return false;
        }

        if (confirmPassword.value !== password.value) {
            showError(
                confirmPassword,
                "confirmPasswordError",
                "Passwords do not match."
            );
            return false;
        }

        clearFieldError(confirmPassword, "confirmPasswordError");
        return true;
    }

    // Live validation: runs whenever a field changes.
    username.addEventListener("input", validateUsername);
    email.addEventListener("input", validateEmail);
    password.addEventListener("input", validatePassword);
    confirmPassword.addEventListener("input", validateConfirmPassword);

    // Map errors returned by Django to the relevant field.
    function displayServerErrors(errors) {
        const fieldMap = {
            username: [username, "usernameError"],
            email: [email, "emailError"],
            password: [password, "passwordError"],
            confirm_password: [confirmPassword, "confirmPasswordError"]
        };

        const generalErrors = [];

        for (const [field, details] of Object.entries(errors)) {
            const messages = Array.isArray(details)
                ? details.map(String)
                : [String(details)];

            if (fieldMap[field]) {
                const [input, errorId] = fieldMap[field];

                showError(input, errorId, messages.join(" "));
            } else {
                generalErrors.push(...messages);
            }
        }

        if (generalErrors.length) {
            message.className = "alert alert-danger";
            message.textContent = generalErrors.join(" ");
        }
    }

    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        message.textContent = "";
        message.className = "";

        // Validate every field before sending the request.
        const isValid = [
            validateUsername(),
            validateEmail(),
            validatePassword(),
            validateConfirmPassword()
        ].every(Boolean);

        if (!isValid) {
            return;
        }

        const data = {
            username: username.value.trim(),
            email: email.value.trim(),
            password: password.value,
            confirm_password: confirmPassword.value
        };

        registerButton.disabled = true;
        registerButton.textContent = "Registering...";

        try {
            const response = await fetch("/api/auth/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            
        if (response.ok) {
            message.className = "alert alert-success";
            message.textContent =
                "Registration successful! Redirecting to login...";

            registerButton.disabled = true;

            // Redirect to login and replace the registration page in history.
            setTimeout(() => {
                window.location.replace("/login/");
            }, 1000);

        } else {
            displayServerErrors(result);
        }

        } catch (error) {
            message.className = "alert alert-danger";
            message.textContent =
                "Unable to connect to the server. Please try again.";
        } finally {
            registerButton.disabled = false;
            registerButton.textContent = "Register";
        }
    });
}


// Login form handling
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");
    const message = document.getElementById("message");
    const loginButton = document.getElementById("loginButton");

    function showLoginError(input, errorElement, text) {
        errorElement.textContent = text;
        input.classList.toggle("is-invalid", Boolean(text));
    }

    username.addEventListener("input", () => {
        showLoginError(username, usernameError, "");
    });

    password.addEventListener("input", () => {
        showLoginError(password, passwordError, "");
    });

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        message.textContent = "";
        message.className = "";

        showLoginError(username, usernameError, "");
        showLoginError(password, passwordError, "");

        let valid = true;

        if (!username.value.trim()) {
            showLoginError(
                username,
                usernameError,
                "Please enter your username."
            );
            valid = false;
        }

        if (!password.value) {
            showLoginError(
                password,
                passwordError,
                "Please enter your password."
            );
            valid = false;
        }

        if (!valid) return;

        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";

        try {
            const response = await fetch("/api/auth/token/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username.value.trim(),
                    password: password.value
                })
            });

            const result = await response.json();

            if (response.ok) {
                // Keep tokens for this browser tab/session.
                sessionStorage.setItem("accessToken", result.access);
                sessionStorage.setItem("refreshToken", result.refresh);


                message.className = "alert alert-success";
                message.textContent = "Login successful! Redirecting...";

                setTimeout(() => {
                    window.location.replace("/dashboard/");
                }, 1000);
            } else {
                message.className = "alert alert-danger";
                message.textContent =
                    "Invalid username or password. Please try again.";
            }
        } catch (error) {
            message.className = "alert alert-danger";
            message.textContent =
                "Unable to connect to the server. Please try again.";
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = "Login";
        }
    });
}
