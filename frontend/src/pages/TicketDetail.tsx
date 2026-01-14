import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../auth/AuthContext';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import DeleteIcon from '@mui/icons-material/Delete';
import FlagIcon from '@mui/icons-material/Flag';
import AttachFileIcon from '@mui/icons-material/AttachFile'; // New Icon
import VideoCallIcon from '@mui/icons-material/VideoCall'; // New Icon
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';

// Types
interface Message {
    chat_id: number;
    message: string;
    attachment: string | null; // Added attachment
    sender: number; // User ID
    sender_name: string;
    sender_role?: string;
    timestamp: string;
    is_read: boolean;
}

interface Ticket {
    ticket_id: number;
    subject: string;
    message: string;
    status: string;
    created_at: string;
}

const TicketDetail: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [chats, setChats] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

    // Reporting
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [reportReason, setReportReason] = useState('');

    const fetchTicketData = async () => {
        try {
            const ticketRes = await axios.get(`${API_BASE_URL}/api/support-tickets/${ticketId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTicket(ticketRes.data);

            const chatRes = await axios.get(`${API_BASE_URL}/api/ticket-chats/?ticket_id=${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChats(chatRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        }
    };

    useEffect(() => {
        if (token && ticketId) {
            fetchTicketData();
            const interval = setInterval(fetchTicketData, 5000);
            return () => clearInterval(interval);
        }
    }, [ticketId, token]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chats]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Allow sending if text OR file exists
        if (!newMessage.trim() && !fileInputRef.current?.files?.[0]) return;

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('ticket', ticketId!);
            formData.append('message', newMessage);

            if (fileInputRef.current?.files?.[0]) {
                formData.append('attachment', fileInputRef.current.files[0]);
            }

            await axios.post(`${API_BASE_URL}/api/ticket-chats/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setNewMessage('');
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
            setShowEmojiPicker(false);
            fetchTicketData();
        } catch (err) {
            console.error("Failed to send message");
        } finally {
            setLoading(false);
        }
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setNewMessage((prev) => prev + emojiData.emoji);
    };

    const handleDeleteMessage = async (chatId: number) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/ticket-chats/${chatId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTicketData();
        } catch (err) {
            console.error("Failed to delete message", err);
            alert("Failed to delete message. You can only delete your own messages.");
        }
    };

    // --- NEW ADMIN FUNCTIONS ---

    const handleDeleteTicket = async () => {
        if (!window.confirm("Are you sure you want to DELETE this entire ticket? This cannot be undone.")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/support-tickets/${ticketId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Ticket deleted successfully.");
            navigate(user?.role === 'admin' ? '/admin-dashboard' : '/community'); // Redirect appropriately
        } catch (err) {
            console.error("Failed to delete ticket", err);
            alert("Failed to delete ticket.");
        }
    }

    const handleStartCall = async () => {
        const jitsiLink = `https://meet.jit.si/Edu2Job-Ticket-${ticketId}`;
        const callMessage = `📞 Join the Video Call: ${jitsiLink}`;

        try {
            setLoading(true);
            await axios.post(`${API_BASE_URL}/api/ticket-chats/`, {
                ticket: ticketId,
                message: callMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTicketData();
        } catch (err) {
            console.error("Failed to send call link", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReport = (chatId: number) => {
        setSelectedChatId(chatId);
        setReportDialogOpen(true);
    };

    const handleSubmitReport = async () => {
        if (!selectedChatId || !reportReason.trim()) return;
        try {
            await axios.post(`${API_BASE_URL}/api/chat-reports/`, {
                chat_message: selectedChatId,
                reason: reportReason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Report submitted successfully.");
            setReportDialogOpen(false);
            setReportReason('');
            setSelectedChatId(null);
        } catch (err) {
            console.error("Failed to submit report", err);
            alert("Failed to submit report.");
        }
    };

    // Render Attachment Helper
    const renderAttachment = (url: string) => {
        const isImage = url.match(/\.(jpeg|jpg|gif|png)$/) != null;
        const isVideo = url.match(/\.(mp4|webm|ogg)$/) != null;

        if (isImage) return <Box component="img" src={url} sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 1, mt: 1, cursor: 'pointer' }} onClick={() => window.open(url, '_blank')} />;
        if (isVideo) return <Box component="video" src={url} controls sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 1, mt: 1 }} />;

        return (
            <Button variant="outlined" size="small" href={url} target="_blank" sx={{ mt: 1, textTransform: 'none' }}>
                Download Attachment
            </Button>
        );
    };

    if (!ticket) return <Typography sx={{ p: 4 }}>Loading Ticket...</Typography>;

    return (
        <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto', height: '90vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Paper elevation={1} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#075e54', color: 'white' }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">#{ticket.ticket_id}: {ticket.subject}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {ticket.status} | {new Date(ticket.created_at).toLocaleString()}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {user?.role === 'admin' && (
                        <>
                            <Tooltip title="Start Video Call">
                                <IconButton onClick={handleStartCall} sx={{ color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
                                    <VideoCallIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Ticket">
                                <IconButton onClick={handleDeleteTicket} sx={{ color: 'white', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                    <Chip
                        label={ticket.status}
                        sx={{ bgcolor: 'white', color: '#075e54', fontWeight: 'bold' }}
                    />
                </Box>
            </Paper>

            {/* Chat Area */}
            <Paper
                elevation={3}
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    bgcolor: '#e5ddd5', // WhatsApp background color
                    backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', // Subtle pattern
                    backgroundBlendMode: 'overlay',
                    borderRadius: 2
                }}
            >
                {/* Messages List */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
                    {chats.map((msg) => {
                        const isMe = msg.sender === user?.user_id;
                        const isAdmin = msg.sender_role === 'admin';

                        return (
                            <Box
                                key={msg.chat_id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                                    mb: 1
                                }}
                            >
                                <Box
                                    className="message-container"
                                    sx={{
                                        maxWidth: '70%',
                                        position: 'relative',
                                        '&:hover .actions': { opacity: 1 }
                                    }}
                                >
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: '10px 14px',
                                            bgcolor: isMe ? '#dcf8c6' : 'white', // WhatsApp Bubble Colors
                                            color: 'black',
                                            borderRadius: 2,
                                            borderTopLeftRadius: !isMe ? 0 : 2,
                                            borderTopRightRadius: isMe ? 0 : 2,
                                            position: 'relative'
                                        }}
                                    >
                                        {!isMe && (
                                            <Typography variant="caption" fontWeight="bold" sx={{ color: isAdmin ? '#d32f2f' : '#1976d2', display: 'block', mb: 0.5 }}>
                                                {msg.sender_name} {isAdmin && '(Support)'}
                                            </Typography>
                                        )}
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                            {/* Detect Links */}
                                            {msg.message.split(' ').map((word, i) => {
                                                if (word.startsWith('http')) return <a key={i} href={word} target="_blank" rel="noopener noreferrer" style={{ color: '#039be5' }}>{word} </a>
                                                return word + ' ';
                                            })}
                                        </Typography>

                                        {/* Attachment */}
                                        {msg.attachment && renderAttachment(msg.attachment)}

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 0.5, opacity: 0.6 }}>
                                            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                            {isMe && (
                                                <span style={{ marginLeft: 4, color: msg.is_read ? '#4fc3f7' : 'inherit' }}>
                                                    {/* Double tick logic could go here if checking read status per message */}
                                                    ✓✓
                                                </span>
                                            )}
                                        </Box>
                                    </Paper>

                                    {/* Actions (Delete/Report) */}
                                    <Box
                                        className="actions"
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            [isMe ? 'left' : 'right']: -30,
                                            opacity: 0,
                                            transition: 'opacity 0.2s'
                                        }}
                                    >
                                        {isMe || user?.role === 'admin' ? (
                                            <IconButton size="small" onClick={() => handleDeleteMessage(msg.chat_id)} color="error">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        ) : (
                                            <IconButton size="small" onClick={() => handleOpenReport(msg.chat_id)} color="warning">
                                                <FlagIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Input Area */}
                <Box sx={{ p: 1, bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ position: 'relative' }}>
                        <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                            <EmojiEmotionsIcon color="action" />
                        </IconButton>
                        {/* File Upload Button */}
                        <IconButton component="label">
                            <input hidden type="file" ref={fileInputRef} onChange={() => { if (newMessage === '') setNewMessage('File attached') }} />
                            <AttachFileIcon color="action" />
                        </IconButton>

                        {showEmojiPicker && (
                            <Box sx={{ position: 'absolute', bottom: 50, left: 0, zIndex: 10 }}>
                                <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={400} />
                            </Box>
                        )}
                    </Box>

                    <TextField
                        fullWidth
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { handleSendMessage(); } }}
                        variant="outlined"
                        size="small"
                        sx={{ bgcolor: 'white', borderRadius: 1 }}
                        disabled={loading || ticket.status === 'Resolved'}
                    />
                    <IconButton
                        onClick={() => handleSendMessage()}
                        disabled={loading || (!newMessage.trim() && !fileInputRef.current?.files?.[0]) || ticket.status === 'Resolved'}
                        color="primary"
                        sx={{ bgcolor: '#128c7e', color: 'white', '&:hover': { bgcolor: '#075e54' } }}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </Paper>

            {/* Report Dialog */}
            <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)}>
                <DialogTitle>Report Message</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Reason for reporting"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmitReport} color="error" variant="contained">
                        Submit Report
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TicketDetail;
