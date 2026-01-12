import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
                    <Box sx={{ p: 4, bgcolor: '#FFF4F4', borderRadius: 2, border: '1px solid #FCC' }}>
                        <Typography variant="h4" color="error" gutterBottom>
                            Something went wrong
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            We're sorry, but the application has encountered an unexpected error.
                        </Typography>

                        {this.state.error && (
                            <Box sx={{ mt: 2, mb: 3, p: 2, bgcolor: '#000', color: '#0F0', borderRadius: 1, textAlign: 'left', overflowX: 'auto', fontSize: '12px', fontFamily: 'monospace' }}>
                                {this.state.error.toString()}
                            </Box>
                        )}

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => window.location.reload()}
                        >
                            Reload Page
                        </Button>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
