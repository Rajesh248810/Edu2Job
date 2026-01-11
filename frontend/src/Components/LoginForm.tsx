import ReCAPTCHA from 'react-google-recaptcha';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Use a fallback key for development if env var is missing (TEST KEY ONLY)
  // This test key works on localhost
  const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check Captcha if simple password check is passed (or check before)
    if (!captchaToken && email !== 'admin@test.com') {
      setError("Please complete the 'I am not a robot' verification.");
      return;
    }

    setLoading(true);

    // TEMPORARY: Mock Admin Login for Testing
    if (email === 'admin@test.com' && password === 'admin') {
      const mockAdminUser = {
        user_id: 999,
        name: 'Test Admin',
        email: 'admin@test.com',
        role: 'admin'
      };
      login(mockAdminUser, 'mock-admin-token');
      navigate('/admin-dashboard');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login/`, {
        email,
        password,
        recaptcha_token: captchaToken
      });
      // ... rest of the logic ...

      console.log("Login Success:", response.data);
      login(response.data.user, response.data.token);

      if (response.data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err: any) {
      console.error("Login Error:", err);

      let errorMessage = 'Login failed.';

      if (err.response) {
        const serverMsg = err.response.data?.error || JSON.stringify(err.response.data);
        errorMessage = `Server Error (${err.response.status}): ${serverMsg}`;
      } else if (err.request) {
        errorMessage = 'Network Error: No response from server. Is the Django Backend running?';
      } else {
        errorMessage = `Error: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        variant="outlined"
        InputLabelProps={{ sx: { color: 'text.secondary' } }}
        sx={textFieldStyle}
      />
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <ReCAPTCHA
          sitekey={SITE_KEY}
          onChange={(token) => setCaptchaToken(token)}
        />
      </Box>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={submitButtonStyle}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
      </Button>

      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            console.log(credentialResponse);
            try {
              setLoading(true);
              const res = await axios.post(`${API_BASE_URL}/api/google-login/`, {
                token: credentialResponse.credential
              });

              if (res.data.is_new_user) {
                // Redirect to Register with pre-filled details
                navigate('/register', {
                  state: {
                    email: res.data.email,
                    name: res.data.name
                  }
                });
              } else {
                login(res.data.user, res.data.token);
                if (res.data.user.role === 'admin') {
                  navigate('/admin-dashboard');
                } else {
                  navigate('/dashboard');
                }
              }
            } catch (err: any) {
              console.error("Google Login Error:", err);
              setError("Google Login Failed: " + (err.response?.data?.error || err.message));
            } finally {
              setLoading(false);
            }
          }}
          onError={() => {
            console.log('Login Failed');
            setError("Google Login Failed");
          }}
        />
      </Box>
    </Box>
  );
};

export default LoginForm;