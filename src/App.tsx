import axios from "axios";
import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";

const App = () => {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [baseURL, setBaseURL] = useState("");

  useEffect(() => {
    const urlToken = searchParams.get("token");
    const tenantDomain = searchParams.get("tenantDomain");
    console.log(urlToken, tenantDomain, "urlToken, tenantDomain");
    setToken(urlToken || "");
    setBaseURL(tenantDomain || "");
  }, [searchParams]);

  const getDashboardURL = (tenantDomain: string): string => {
    const domainMap: { [key: string]: string } = {
      "https://dev.hennypenny.com": "https://dashboard-dev.hennylink.com/",
      "https://dashboard.hennypenny.com":
        "https://dashboard-test.hennylink.com/",
      "https://prod.hennypenny.com": "https://dashboard.hennylink.com/",
    };

    const normalizedDomain = tenantDomain.replace(/\/$/, "");
    return domainMap[normalizedDomain] || `${normalizedDomain}/login`;
  };

  const calculatePasswordStrength = (password: string): string => {
    if (!password) return "RED";
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[~!@#$%^&*()_+\-=;:<>[\]\\|/]/.test(password)) score++;

    if (score === 5) return "GREEN";
    if (score >= 3) return "YELLOW";
    return "RED";
  };

  const checkRequirement = (password: string, requirement: string): boolean => {
    if (!password) return false;

    switch (requirement) {
        case 'length':
            return password.length >= 8;
        case 'lowercase':
            return /[a-z]/.test(password);
        case 'uppercase':
            return /[A-Z]/.test(password);
        case 'number':
            return /[0-9]/.test(password);
        case 'symbol':
            return /[~!@#$%^&*()_+\-=;:<>[\]\\\/|]/.test(password);
        default:
            return false;
    }
};

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token || !baseURL) {
      alert("Reset link is missing required details.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const passwordStrength = calculatePasswordStrength(form.password);
    const api = axios.create({
      baseURL: baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    setLoading(true);
    try {
      const response = await api.post("/user/passwordReset", {
        token: token,
        email: form.email,
        newPassword: form.password,
        passwordStrength: passwordStrength,
      });

      if (response.status === 200 || response.status === 201) {
        setForm({
          email: "",
          password: "",
          confirmPassword: "",
        });
        const dashboardURL = getDashboardURL(baseURL);
        window.location.href = dashboardURL;
      } else {
        alert("Reset failed. Please try again.");
      }
    } catch (err) {
      console.error("Reset password failed", err);
      alert("Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-sm text-center">
        <h2 className="text-3xl font-bold text-blue-600 mb-2">
          Reset password
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Enter your email and new password to reset your account
        </p>

        <form onSubmit={handleResetPassword} className="space-y-4 text-left">
          <div>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
              placeholder="Enter your password"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
              placeholder="Confirm your password"
              required
            />
          </div>
          <div className="mb-6 sm:mb-8 md:mb-8">
            <p className="text-sm sm:text-base mb-3">
              Password must meet the requirements below:
            </p>
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex items-center gap-2 sm:gap-3">
                <span
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    checkRequirement(form.password, "length")
                      ? "bg-green-500 text-white"
                      : "border border-gray-400"
                  }`}
                >
                  {checkRequirement(form.password, "length") && "✓"}
                </span>
                <span className="text-xs sm:text-sm">
                  Must have at least 8 characters
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    checkRequirement(form.password, "lowercase")
                      ? "bg-green-500 text-white"
                      : "border border-gray-400"
                  }`}
                >
                  {checkRequirement(form.password, "lowercase") && "✓"}
                </span>
                <span className="text-xs sm:text-sm">
                  Include lowercase characters (for example, abcdef)
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    checkRequirement(form.password, "uppercase")
                      ? "bg-green-500 text-white"
                      : "border border-gray-400"
                  }`}
                >
                  {checkRequirement(form.password, "uppercase") && "✓"}
                </span>
                <span className="text-xs sm:text-sm">
                  Include uppercase characters (for example, ABCDEF)
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    checkRequirement(form.password, "number")
                      ? "bg-green-500 text-white"
                      : "border border-gray-400"
                  }`}
                >
                  {checkRequirement(form.password, "number") && "✓"}
                </span>
                <span className="text-xs sm:text-sm">
                  Include numbers (for example, 123456)
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    checkRequirement(form.password, "symbol")
                      ? "bg-green-500 text-white"
                      : "border border-gray-400"
                  }`}
                >
                  {checkRequirement(form.password, "symbol") && "✓"}
                </span>
                <span className="text-xs sm:text-sm">
                  Include symbols (for example, !@#$%^*)
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
