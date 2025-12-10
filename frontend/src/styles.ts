export const textFieldStyle = {
    bgcolor: 'background.paper',
    borderRadius: 1.5,
    '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        '&:hover fieldset': { borderColor: '#667eea' },
        '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 },
    },
    '& .MuiInputBase-input': { color: 'text.primary' }
};

export const submitButtonStyle = {
    mt: 3,
    mb: 2,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    height: '48px',
    fontWeight: 'bold',
    fontSize: '16px',
    borderRadius: 2,
    textTransform: 'none',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    '&:hover': {
        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
    }
};
