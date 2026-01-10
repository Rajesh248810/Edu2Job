import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Button,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tooltip,
    Alert,
    CircularProgress,
    Checkbox
} from '@mui/material';
import {
    Flag as FlagIcon,
    Edit as EditIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../api';
import { API_BASE_URL } from '../config';

interface PredictionLog {
    id: number;
    user_name: string;
    user_email: string;
    predicted_roles: string;
    confidence_scores: any;
    timestamp: string;
    is_flagged: boolean;
    corrected_role?: string;
    admin_notes?: string;
}

const PredictionLogTable: React.FC = () => {
    const [logs, setLogs] = useState<PredictionLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Correction Dialog State
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedLog, setSelectedLog] = useState<PredictionLog | null>(null);
    const [correction, setCorrection] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [searchTerm, setSearchTerm] = useState('');

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchLogs(searchTerm);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const fetchLogs = async (query = '') => {
        setLoading(true);
        try {
            const res = await api.get(`${API_BASE_URL}/api/admin/prediction-logs/`, {
                params: { search: query }
            });
            setLogs(res.data);
        } catch (err) {
            setError('Failed to fetch prediction logs');
        } finally {
            setLoading(false);
        }
    };

    const handleFlag = async (log: PredictionLog) => {
        try {
            const newFlagStatus = !log.is_flagged;
            await api.patch(`${API_BASE_URL}/api/admin/prediction-logs/${log.id}/`, {
                is_flagged: newFlagStatus
            });

            // Update local state
            setLogs(logs.map(l => l.id === log.id ? { ...l, is_flagged: newFlagStatus } : l));
            setSuccessMsg(newFlagStatus ? 'Prediction flagged as incorrect' : 'Flag removed');
        } catch (err) {
            setError('Failed to update flag status');
        }
    };

    const handleOpenCorrection = (log: any) => {
        setSelectedLog(log);
        setCorrection(log.corrected_role || '');
        setNotes(log.admin_notes || '');
        setOpenDialog(true);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = logs.map(l => l.id);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleDelete = async (idsToDelete: number[]) => {
        if (idsToDelete.length === 0) return;

        if (!window.confirm(`Are you sure you want to delete ${idsToDelete.length} logs?`)) return;

        try {
            await api.delete(`${API_BASE_URL}/api/admin/prediction-logs/`, {
                data: { log_ids: idsToDelete }
            });
            setSuccessMsg('Logs deleted successfully');
            setSelectedIds([]);
            fetchLogs(searchTerm); // Refresh list
        } catch (err) {
            console.error('Delete error', err);
            setError('Failed to delete logs');
        }
    };

    const handleBulkFlag = async (action: 'flag' | 'unflag') => {
        if (selectedIds.length === 0) return;

        try {
            await api.patch(`${API_BASE_URL}/api/admin/prediction-logs/`, {
                log_ids: selectedIds,
                action: action
            });
            setSuccessMsg(`Logs ${action === 'flag' ? 'flagged' : 'unflagged'} successfully`);
            setSelectedIds([]);
            fetchLogs(searchTerm);
        } catch (err) {
            console.error('Bulk action error', err);
            setError('Failed to update logs');
        }
    };


    const handleSaveCorrection = async () => {
        if (!selectedLog) return;

        try {
            await api.patch(`${API_BASE_URL}/api/admin/prediction-logs/${selectedLog.id}/`, {
                corrected_role: correction,
                admin_notes: notes,
                is_flagged: true // Auto-flag if correcting
            });

            setLogs(logs.map(l => l.id === selectedLog.id ? {
                ...l,
                corrected_role: correction,
                admin_notes: notes,
                is_flagged: true
            } : l));

            setSuccessMsg('Correction saved successfully');
            setOpenDialog(false);
        } catch (err) {
            setError('Failed to save correction');
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Prediction Monitoring & Feedback</Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {selectedIds.length > 0 && (
                    <>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(selectedIds)}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                        >
                            Delete ({selectedIds.length})
                        </Button>
                        <Button
                            variant="outlined"
                            color="warning"
                            startIcon={<FlagIcon />}
                            onClick={() => handleBulkFlag('flag')}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                        >
                            Flag ({selectedIds.length})
                        </Button>
                        <Button
                            variant="outlined"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleBulkFlag('unflag')}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                        >
                            Unflag ({selectedIds.length})
                        </Button>
                    </>
                )}
                <TextField
                    label="Search by User or Role"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchLogs(searchTerm)}
                    placeholder="Press Enter to search..."
                />
                <Button variant="contained" onClick={() => fetchLogs(searchTerm)}>Search</Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(224, 224, 224, 1)' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)' }}>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedIds.length > 0 && selectedIds.length < logs.length}
                                        checked={logs.length > 0 && selectedIds.length === logs.length}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Predicted Role</TableCell>
                                <TableCell>Confidence</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Correction</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((log) => {
                                // Robust extraction of confidence
                                let confidenceDisplay = 'N/A';
                                if (Array.isArray(log.confidence_scores) && log.confidence_scores.length > 0) {
                                    const score = log.confidence_scores[0]?.confidence || log.confidence_scores[0]?.score; // Check common keys
                                    if (score !== undefined) {
                                        confidenceDisplay = `${Math.round(score)}%`;
                                    }
                                }

                                return (
                                    <TableRow
                                        key={log.id}
                                        selected={selectedIds.includes(log.id)}
                                        hover
                                        sx={{
                                            '&.Mui-selected': { bgcolor: 'rgba(25, 118, 210, 0.08) !important' },
                                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' },
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedIds.includes(log.id)}
                                                onChange={() => handleSelectOne(log.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(log.timestamp).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">{log.user_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{log.user_email}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={log.predicted_roles} color="primary" variant="outlined" size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{confidenceDisplay}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            {log.is_flagged ? (
                                                <Chip icon={<WarningIcon />} label="Flagged" color="error" size="small" />
                                            ) : (
                                                <Chip icon={<CheckCircleIcon />} label="Valid" color="success" size="small" variant="outlined" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {log.corrected_role ? (
                                                <Typography variant="body2" color="error" fontWeight="bold">
                                                    {log.corrected_role}
                                                </Typography>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Flag as Incorrect">
                                                <IconButton
                                                    color={log.is_flagged ? "error" : "default"}
                                                    onClick={() => handleFlag(log)}
                                                >
                                                    <FlagIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Provide Correction">
                                                <IconButton color="primary" onClick={() => handleOpenCorrection(log)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton color="error" onClick={() => handleDelete([log.id])}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            {logs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">No predictions logged yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Correction Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Correct Prediction</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Original Prediction: <strong>{selectedLog?.predicted_roles}</strong>
                    </Typography>

                    <TextField
                        autoFocus
                        margin="dense"
                        label="Correct Job Role"
                        fullWidth
                        variant="outlined"
                        value={correction}
                        onChange={(e) => setCorrection(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        margin="dense"
                        label="Admin Notes"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveCorrection} variant="contained" color="primary">Save Correction</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PredictionLogTable;
