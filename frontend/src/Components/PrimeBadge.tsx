import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';

const PrimeBadge: React.FC = () => {
    return (
        <Tooltip title="Prime Member">
            <Chip
                icon={<VerifiedIcon sx={{ fontSize: '16px !important', color: '#FFD700 !important' }} />}
                label="PRIME"
                size="small"
                sx={{
                    ml: 1,
                    background: 'linear-gradient(45deg, #000 30%, #333 90%)',
                    color: '#FFD700',
                    fontWeight: 'bold',
                    fontSize: '0.7rem',
                    border: '1px solid #FFD700',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
            />
        </Tooltip>
    );
};

export default PrimeBadge;
