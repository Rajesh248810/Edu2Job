
import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, Grid } from '@mui/material';
import { API_BASE_URL } from '../config';

// --- TYPES ---
export interface UserCompleteProfile {
    user_id: number;
    name: string;
    email: string;
    role: string;
    phone?: string;
    profile_picture?: string;
    about_me?: string;
    education: any[];
    skills: any[];
    certifications: any[];
    placements: any[];
    predictions?: any[];
}

export interface TemplateProps {
    profile: UserCompleteProfile;
    isEditing?: boolean;
}

// --- UTILS ---
const getInitial = (name: string) => name ? name[0].toUpperCase() : 'U';

// --- EDITABLE COMPONENT ---
export const EditableText = ({ text, isEditing, tag = 'span', className = '', style = {}, placeholder = '' }: { text: string | undefined, isEditing?: boolean, tag?: any, className?: string, style?: any, placeholder?: string }) => {
    const Tag = tag;
    const [content, setContent] = useState(text || placeholder);

    useEffect(() => {
        if (text) setContent(text);
    }, [text]);

    return (
        <Tag
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            className={className}
            style={{
                ...style,
                border: isEditing ? '1px dashed #999' : 'none',
                minWidth: isEditing ? '20px' : 'auto',
                cursor: isEditing ? 'text' : 'inherit',
                outline: 'none',
                backgroundColor: isEditing ? 'rgba(255, 255, 0, 0.05)' : 'transparent',
                transition: 'background-color 0.2s',
                display: style.display || 'inline-block'
            }}
            onInput={(e: any) => setContent(e.currentTarget.textContent)}
            onBlur={() => {
                // Optional: You could trigger a save callback here if we wanted to persist to a temp state in parent
            }}
        >
            {content}
        </Tag>
    );
};

// --- TEMPLATE 1: THE "IVY" (Academic/Classic Premium) ---
export const TemplateIvy: React.FC<TemplateProps> = ({ profile, isEditing }) => (
    <Box sx={{ p: 5, fontFamily: 'Georgia, "Times New Roman", serif', color: '#111', lineHeight: 1.6, height: '100%', bgcolor: 'white' }}>
        {/* Header with Image */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
                <EditableText tag="h1" text={profile.name} isEditing={isEditing} style={{ fontSize: '2.5rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '2px' }} />
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, fontSize: '0.9rem' }}>
                    <EditableText text={profile.role} isEditing={isEditing} />
                    <span>|</span>
                    <EditableText text={profile.email} isEditing={isEditing} />
                    {profile.phone && <><span>|</span><EditableText text={profile.phone} isEditing={isEditing} /></>}
                </Box>
            </Box>
            {profile.profile_picture && (
                <Box sx={{ width: 80, height: 80, overflow: 'hidden', borderRadius: '50%', ml: 3, border: '1px solid #ccc' }}>
                    <img src={`${API_BASE_URL}${profile.profile_picture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
            )}
        </Box>

        <Divider sx={{ bgcolor: 'black', mb: 3 }} />

        {/* Education */}
        <SectionHeaderIvy title="EDUCATION" />
        {profile.education.map((e, i) => (
            <Box key={i} sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Box>
                    <EditableText tag="div" text={e.university} isEditing={isEditing} style={{ fontWeight: 'bold', fontSize: '1.1rem' }} />
                    <Box component="span" sx={{ fontStyle: 'italic' }}>
                        <EditableText text={e.degree} isEditing={isEditing} /> in <EditableText text={e.specialization} isEditing={isEditing} />
                    </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <EditableText tag="div" text={e.year_of_completion?.toString()} isEditing={isEditing} />
                    {e.cgpa && <EditableText tag="div" text={`GPA: ${e.cgpa}`} isEditing={isEditing} style={{ fontSize: '0.9rem' }} />}
                </Box>
            </Box>
        ))}

        {/* Skills */}
        <SectionHeaderIvy title="SKILLS" />
        <Box sx={{ mb: 3 }}>
            <EditableText
                text={profile.skills.map(s => s.skill_name).join(' • ')}
                isEditing={isEditing}
                style={{ width: '100%', display: 'block' }}
            />
        </Box>

        {/* Experience */}
        {profile.placements && profile.placements.length > 0 && (
            <>
                <SectionHeaderIvy title="PROFESSIONAL EXPERIENCE" />
                {profile.placements.map((p, i) => (
                    <Box key={i} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <EditableText tag="div" text={p.company} isEditing={isEditing} style={{ fontWeight: 'bold', fontSize: '1.1rem' }} />
                            <EditableText text={p.date_of_joining} isEditing={isEditing} style={{ fontStyle: 'italic' }} />
                        </Box>
                        <EditableText tag="div" text={p.role} isEditing={isEditing} style={{ fontWeight: 'bold', fontSize: '1rem', fontStyle: 'italic', marginBottom: '4px' }} />
                        <EditableText tag="div" text="• Selected through rigorous campus placement drive." isEditing={isEditing} style={{ fontSize: '0.95rem' }} />
                    </Box>
                ))}
            </>
        )}

        {/* Certifications (Added) */}
        {profile.certifications && profile.certifications.length > 0 && (
            <>
                <SectionHeaderIvy title="CERTIFICATIONS" />
                {profile.certifications.map((c, i) => (
                    <Box key={i} sx={{ mb: 1 }}>
                        <EditableText tag="span" text={c.cert_name} isEditing={isEditing} style={{ fontWeight: 'bold' }} />
                        <span style={{ margin: '0 8px' }}>|</span>
                        <EditableText tag="span" text={c.issuing_organization} isEditing={isEditing} />
                    </Box>
                ))}
                <Box sx={{ mb: 3 }} />
            </>
        )}

        {/* AI Insights */}
        {profile.predictions && profile.predictions.length > 0 && (
            <Box sx={{ mt: 4, pt: 2, borderTop: '1px dotted #ccc' }}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: '#666' }}>AI Career Projection</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Typography component="span">Strong match for:</Typography>
                    <EditableText tag="span" text={profile.predictions[0].predicted_roles} isEditing={isEditing} style={{ fontWeight: 'bold', borderBottom: '1px solid #999' }} />
                </Box>
            </Box>
        )}
    </Box>
);

const SectionHeaderIvy = ({ title }: { title: string }) => (
    <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{
            textTransform: 'uppercase',
            fontSize: '1rem',
            fontWeight: 'bold',
            letterSpacing: '1px',
            borderBottom: '1px solid black',
            pb: 0.5
        }}>{title}</Typography>
    </Box>
);

// --- TEMPLATE 2: THE "EXECUTIVE" (Corporate/Clean) ---
export const TemplateExecutive: React.FC<TemplateProps> = ({ profile, isEditing }) => (
    <Box sx={{ p: 0, height: '100%', bgcolor: 'white', display: 'flex', flexDirection: 'column', color: '#333', fontFamily: '"Arial", sans-serif' }}>
        {/* Header Bar with Image */}
        <Box sx={{ bgcolor: '#2c3e50', color: 'white', p: 5, pb: 6, display: 'flex', gap: 4, alignItems: 'center' }}>
            {profile.profile_picture && (
                <Box sx={{ width: 100, height: 100, overflow: 'hidden', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)' }}>
                    <img src={`${API_BASE_URL}${profile.profile_picture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
            )}
            <Box>
                <EditableText tag="h1" text={profile.name} isEditing={isEditing} style={{ fontSize: '3rem', fontWeight: 700, margin: 0, lineHeight: 1 }} />
                <EditableText tag="div" text={profile.role} isEditing={isEditing} style={{ fontSize: '1.4rem', color: '#bdc3c7', marginTop: '10px', fontWeight: 300 }} />
            </Box>
        </Box>

        {/* Contact Strip */}
        <Box sx={{ bgcolor: '#34495e', color: '#ecf0f1', p: 2, px: 5, fontSize: '0.9rem', display: 'flex', gap: 4, fontWeight: 500 }}>
            <EditableText text={profile.email} isEditing={isEditing} />
            {profile.phone && <EditableText text={profile.phone} isEditing={isEditing} />}
            <EditableText text="LinkedIn / Portfolio" isEditing={isEditing} placeholder="Add Link..." />
        </Box>

        <Box sx={{ p: 5, display: 'grid', gridTemplateColumns: '70% 30%', gap: 4, flexGrow: 1 }}>
            {/* Main Column */}
            <Box>
                {/* About Me (Added) */}
                {profile.about_me && (
                    <Box sx={{ mb: 4 }}>
                        <SectionHeaderExecutive title="PROFESSIONAL SUMMARY" />
                        <EditableText tag="div" text={profile.about_me} isEditing={isEditing} style={{ lineHeight: 1.6 }} />
                    </Box>
                )}

                <SectionHeaderExecutive title="EXPERIENCE" />
                {profile.placements?.map((p, i) => (
                    <Box key={i} sx={{ mb: 3 }}>
                        <EditableText tag="div" text={p.role} isEditing={isEditing} style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50' }} />
                        <EditableText tag="div" text={p.company} isEditing={isEditing} style={{ fontSize: '1rem', fontWeight: 600, color: '#7f8c8d' }} />
                        <EditableText tag="div" text={p.date_of_joining} isEditing={isEditing} style={{ fontSize: '0.85rem', color: '#95a5a6', marginBottom: '8px' }} />
                        <EditableText tag="p" text="Successfully placed via campus recruitment program." isEditing={isEditing} />
                    </Box>
                ))}
            </Box>

            {/* Sidebar Column */}
            <Box>
                <SectionHeaderExecutive title="EDUCATION" />
                {profile.education.map((e, i) => (
                    <Box key={i} sx={{ mb: 3 }}>
                        <EditableText tag="div" text={e.university} isEditing={isEditing} style={{ fontWeight: 'bold' }} />
                        <EditableText tag="div" text={e.degree} isEditing={isEditing} style={{ fontSize: '0.9rem' }} />
                        <EditableText tag="div" text={e.year_of_completion} isEditing={isEditing} style={{ fontSize: '0.85rem', color: '#7f8c8d' }} />
                    </Box>
                ))}

                <SectionHeaderExecutive title="SKILLS" />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {profile.skills.map((s, i) => (
                        <Box key={i} sx={{ bgcolor: '#ecf0f1', p: 1, borderRadius: 1, px: 2, fontSize: '0.9rem', color: '#2c3e50', fontWeight: 500 }}>
                            <EditableText text={s.skill_name} isEditing={isEditing} />
                        </Box>
                    ))}
                </Box>

                <Box sx={{ mt: 4 }}>
                    <SectionHeaderExecutive title="CERTIFICATIONS" />
                    {profile.certifications?.map((c, i) => (
                        <Box key={i} sx={{ mb: 2 }}>
                            <EditableText tag="div" text={c.cert_name} isEditing={isEditing} style={{ fontWeight: 'bold', fontSize: '0.9rem' }} />
                            <EditableText tag="div" text={c.issuing_organization} isEditing={isEditing} style={{ fontSize: '0.8rem', color: '#7f8c8d' }} />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    </Box>
);

const SectionHeaderExecutive = ({ title }: { title: string }) => (
    <Box sx={{ mb: 2, pb: 1, borderBottom: '2px solid #bdc3c7' }}>
        <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '1px', color: '#7f8c8d' }}>{title}</Typography>
    </Box>
);

// --- TEMPLATE 3: THE "MINIMALIST" (Tech/Startup) ---
export const TemplateMinimalist: React.FC<TemplateProps> = ({ profile, isEditing }) => (
    <Box sx={{ p: 6, fontFamily: '"Courier New", Courier, monospace', color: '#333', height: '100%', bgcolor: 'white' }}>
        <Box sx={{ borderBottom: '4px solid black', pb: 4, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
                <EditableText tag="h1" text={profile.name} isEditing={isEditing} style={{ fontSize: '3rem', fontWeight: 900, textTransform: 'lowercase', letterSpacing: '-2px', margin: 0 }} />
                <EditableText tag="div" text={`> ${profile.role}`} isEditing={isEditing} style={{ fontSize: '1.2rem', marginTop: '10px' }} />
                <EditableText tag="div" text={`> ${profile.email}`} isEditing={isEditing} style={{ fontSize: '0.9rem', color: '#666' }} />
            </Box>
            {/* Image (ASCII Style) */}
            {profile.profile_picture && (
                <Box sx={{ filter: 'grayscale(100%) contrast(1.2)', border: '2px solid black', p: 0.5 }}>
                    <img src={`${API_BASE_URL}${profile.profile_picture}`} alt="Profile" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                </Box>
            )}
        </Box>

        <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ bgcolor: 'black', color: 'white', display: 'inline-block', px: 1, mb: 2 }}>// PROFILE</Typography>
                    <Box sx={{ borderLeft: '2px solid #eee', pl: 2 }}>
                        <EditableText tag="div" text={profile.about_me || "No profile bio available."} isEditing={isEditing} style={{ whiteSpace: 'pre-wrap' }} />
                    </Box>
                </Box>

                <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ bgcolor: 'black', color: 'white', display: 'inline-block', px: 1, mb: 2 }}>// EXPERIENCE</Typography>
                    {profile.placements?.map((p, i) => (
                        <Box key={i} sx={{ mb: 4, pl: 2 }}>
                            <EditableText tag="div" text={p.role} isEditing={isEditing} style={{ fontSize: '1.2rem', fontWeight: 'bold' }} />
                            <EditableText tag="div" text={`@ ${p.company}`} isEditing={isEditing} style={{ fontSize: '1rem' }} />
                            <EditableText tag="div" text={`// ${p.date_of_joining}`} isEditing={isEditing} style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }} />
                        </Box>
                    ))}
                </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ bgcolor: 'black', color: 'white', display: 'inline-block', px: 1, mb: 2 }}>// SKILLS</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {profile.skills.map((s, i) => (
                            <Box key={i} sx={{ border: '1px solid black', px: 1, fontSize: '0.85rem' }}>
                                <EditableText text={s.skill_name} isEditing={isEditing} />
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ bgcolor: 'black', color: 'white', display: 'inline-block', px: 1, mb: 2 }}>// CERTS</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {profile.certifications?.map((c, i) => (
                            <Box key={i} sx={{ fontSize: '0.85rem' }}>
                                {'>'} <EditableText text={c.cert_name} isEditing={isEditing} />
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ bgcolor: 'black', color: 'white', display: 'inline-block', px: 1, mb: 2 }}>// EDUCATION</Typography>
                    {profile.education.map((e, i) => (
                        <Box key={i} sx={{ mb: 3 }}>
                            <EditableText tag="div" text={e.university} isEditing={isEditing} style={{ fontWeight: 'bold' }} />
                            <EditableText tag="div" text={e.degree} isEditing={isEditing} style={{ fontSize: '0.9rem' }} />
                        </Box>
                    ))}
                </Box>
            </Grid>
        </Grid>
    </Box>
);

// --- TEMPLATE 4 (11): BLUE STEEL (Updated) ---
export const TemplateBlueSteel: React.FC<TemplateProps> = ({ profile, isEditing }) => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white', color: '#1a1a1a', fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <Box sx={{ bgcolor: '#2c3e50', color: 'white', p: 4, pt: 5, pb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ width: 100, height: 100, borderRadius: '50%', border: '2px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                    {profile.profile_picture ?
                        <img src={`${API_BASE_URL}${profile.profile_picture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                        <Typography variant="h3">{getInitial(profile.name)}</Typography>
                    }
                </Box>
                <Box>
                    <EditableText tag="h1" text={profile.name} isEditing={isEditing} style={{ fontSize: '2.5rem', fontWeight: 'bold', textTransform: 'uppercase', margin: 0, lineHeight: 1.2 }} />
                    <EditableText tag="div" text={profile.role} isEditing={isEditing} style={{ fontSize: '1.2rem', opacity: 0.9, marginTop: 4 }} />
                    <EditableText tag="div" text={profile.email} isEditing={isEditing} style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: 2 }} />
                </Box>
            </Box>
        </Box>

        {/* content */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', flexGrow: 1 }}>
            {/* Left Col */}
            <Box sx={{ p: 4, pr: 2 }}>
                <SectionHeaderBlueSteel title="SKILLS" />
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {profile.skills.map(s => (
                        <li key={s.skill_id} style={{ marginBottom: 4 }}>
                            <EditableText text={s.skill_name} isEditing={isEditing} />
                        </li>
                    ))}
                </Box>

                <Box sx={{ mt: 4 }}>
                    <SectionHeaderBlueSteel title="EDUCATION" />
                    {profile.education.map((e, i) => (
                        <Box key={i} sx={{ mb: 2 }}>
                            <EditableText tag="div" text={e.degree} isEditing={isEditing} style={{ fontWeight: 'bold' }} />
                            <EditableText tag="div" text={e.university} isEditing={isEditing} style={{ fontSize: '0.9rem' }} />
                            <EditableText tag="div" text={`${e.year_of_completion} | CGPA: ${e.cgpa}`} isEditing={isEditing} style={{ fontSize: '0.8rem', color: '#666' }} />
                        </Box>
                    ))}
                </Box>

                {/* Certifications Added */}
                <Box sx={{ mt: 4 }}>
                    <SectionHeaderBlueSteel title="CERTIFICATIONS" />
                    {profile.certifications?.map((c, i) => (
                        <Box key={i} sx={{ mb: 1 }}>
                            <EditableText tag="div" text={c.cert_name} isEditing={isEditing} style={{ fontWeight: 'bold', fontSize: '0.9rem' }} />
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Right Col */}
            <Box sx={{ p: 4, pl: 2 }}>
                <SectionHeaderBlueSteel title="ABOUT ME" />
                <EditableText tag="div" text={profile.about_me || "Add an About Me description..."} isEditing={isEditing} style={{ marginBottom: 24, lineHeight: 1.6 }} />

                <SectionHeaderBlueSteel title="EXPERIENCE / PLACEMENTS" />
                {profile.placements?.map((p, i) => (
                    <Box key={i} sx={{ mb: 3 }}>
                        <EditableText tag="div" text={p.role} isEditing={isEditing} style={{ fontWeight: 'bold', fontSize: '1.1rem' }} />
                        <EditableText tag="div" text={p.company} isEditing={isEditing} style={{ color: '#3498db', fontSize: '1rem' }} />
                        <EditableText tag="div" text={`Joined: ${p.date_of_joining}`} isEditing={isEditing} style={{ fontSize: '0.8rem', color: '#777', marginBottom: 4 }} />
                        <EditableText tag="div" text="Placed via Edu2Job Campus Drive." isEditing={isEditing} style={{ fontSize: '0.9rem' }} />
                    </Box>
                ))}

                {/* Career Path Insights */}
                {profile.predictions && profile.predictions.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <SectionHeaderBlueSteel title="CAREER PATH INSIGHTS" />
                        <Typography variant="body2" fontStyle="italic" color="text.secondary" gutterBottom>
                            Based on Edu2Job AI Analysis, {profile.name} is a strong candidate for roles such as:
                        </Typography>
                        <ul style={{ paddingLeft: 20 }}>
                            <li style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50' }}>
                                <EditableText text={profile.predictions[0].predicted_roles} isEditing={isEditing} />
                            </li>
                        </ul>
                    </Box>
                )}
            </Box>
        </Box>
    </Box>
);

const SectionHeaderBlueSteel = ({ title }: { title: string }) => (
    <Box sx={{ borderBottom: '2px solid #3498db', mb: 2, pb: 0.5 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'uppercase', color: '#2c3e50', fontSize: '1.1rem' }}>
            {title}
        </Typography>
    </Box>
);

// --- NEW TEMPLATE 5: THE "ELEGANT" (Sidebar Left, Soft Colors) ---
export const TemplateElegant: React.FC<TemplateProps> = ({ profile, isEditing }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: '35% 65%', height: '100%', bgcolor: 'white', fontFamily: '"Open Sans", sans-serif' }}>
        {/* Sidebar */}
        <Box sx={{ bgcolor: '#f0f3f5', p: 4, borderRight: '1px solid #e1e4e8' }}>
            {/* Profile Pic */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <Box sx={{ width: 140, height: 140, borderRadius: '50%', overflow: 'hidden', border: '5px solid white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    {profile.profile_picture ?
                        <img src={`${API_BASE_URL}${profile.profile_picture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                        <Box sx={{ width: '100%', height: '100%', bgcolor: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getInitial(profile.name)}</Box>
                    }
                </Box>
            </Box>

            <SectionHeaderElegant title="CONTACT" />
            <Box sx={{ fontSize: '0.9rem', mb: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <EditableText text={profile.email} isEditing={isEditing} />
                {profile.phone && <EditableText text={profile.phone} isEditing={isEditing} />}
            </Box>

            <SectionHeaderElegant title="SKILLS" />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                {profile.skills.map((s, i) => (
                    <Box key={i} sx={{ bgcolor: 'white', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.8rem', border: '1px solid #ddd' }}>
                        <EditableText text={s.skill_name} isEditing={isEditing} />
                    </Box>
                ))}
            </Box>

            <SectionHeaderElegant title="CERTIFICATIONS" />
            {profile.certifications?.map((c, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                    <EditableText tag="div" text={c.cert_name} isEditing={isEditing} style={{ fontWeight: 'bold', fontSize: '0.9rem' }} />
                    <EditableText tag="div" text={c.issuing_organization} isEditing={isEditing} style={{ fontSize: '0.8rem', color: '#666' }} />
                </Box>
            ))}
        </Box>

        {/* Main */}
        <Box sx={{ p: 5 }}>
            <EditableText tag="h1" text={profile.name} isEditing={isEditing} style={{ fontSize: '2.5rem', fontWeight: 300, color: '#2C3E50', margin: 0 }} />
            <EditableText tag="div" text={profile.role} isEditing={isEditing} style={{ fontSize: '1.2rem', color: '#e74c3c', marginTop: '5px', letterSpacing: '1px', textTransform: 'uppercase' }} />

            <Box sx={{ mt: 5 }}>
                <SectionHeaderElegantMain title="ABOUT ME" />
                <EditableText tag="div" text={profile.about_me || "Description..."} isEditing={isEditing} style={{ lineHeight: 1.7, color: '#555' }} />
            </Box>

            <Box sx={{ mt: 5 }}>
                <SectionHeaderElegantMain title="EXPERIENCE" />
                {profile.placements?.map((p, i) => (
                    <Box key={i} sx={{ mb: 4 }}>
                        <EditableText tag="h3" text={p.role} isEditing={isEditing} style={{ margin: 0, fontSize: '1.1rem' }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <EditableText tag="span" text={p.company} isEditing={isEditing} style={{ fontWeight: 'bold', color: '#7f8c8d' }} />
                            <EditableText tag="span" text={p.date_of_joining} isEditing={isEditing} style={{ fontSize: '0.8rem', color: '#95a5a6' }} />
                        </Box>
                        <EditableText tag="p" text="Successfully placed via Edu2Job." isEditing={isEditing} style={{ fontSize: '0.9rem', color: '#666' }} />
                    </Box>
                ))}
            </Box>

            <Box sx={{ mt: 5 }}>
                <SectionHeaderElegantMain title="EDUCATION" />
                {profile.education.map((e, i) => (
                    <Box key={i} sx={{ mb: 3 }}>
                        <EditableText tag="div" text={e.university} isEditing={isEditing} style={{ fontWeight: 'bold' }} />
                        <EditableText tag="div" text={`${e.degree} - ${e.specialization}`} isEditing={isEditing} style={{ fontSize: '0.95rem' }} />
                        <EditableText tag="div" text={`Graduation: ${e.year_of_completion}`} isEditing={isEditing} style={{ fontSize: '0.9rem', color: '#888' }} />
                    </Box>
                ))}
            </Box>
        </Box>
    </Box>
);

const SectionHeaderElegant = ({ title }: { title: string }) => (
    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#95a5a6', letterSpacing: '1px', mb: 2, borderBottom: '1px solid #ddd', pb: 0.5 }}>{title}</Typography>
);

const SectionHeaderElegantMain = ({ title }: { title: string }) => (
    <Typography variant="h6" fontWeight="bold" sx={{ color: '#34495e', mb: 3, borderBottom: '2px solid #e74c3c', display: 'inline-block', pb: 0.5, pr: 2 }}>{title}</Typography>
);


// --- NEW TEMPLATE 6: THE "BOLD" (High Contrast, Big Type) ---
export const TemplateBold: React.FC<TemplateProps> = ({ profile, isEditing }) => (
    <Box sx={{ p: 0, height: '100%', bgcolor: 'white', display: 'flex', flexDirection: 'column', fontFamily: 'Impact, "Arial Black", sans-serif' }}>
        <Box sx={{ bgcolor: 'black', color: 'white', p: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
                <EditableText tag="h1" text={profile.name} isEditing={isEditing} style={{ fontSize: '4rem', textTransform: 'uppercase', lineHeight: 0.9, letterSpacing: '-1px' }} />
                <EditableText tag="div" text={profile.role} isEditing={isEditing} style={{ fontFamily: 'Arial, sans-serif', fontSize: '1.5rem', color: '#f1c40f', marginTop: 10 }} />
            </Box>
            {profile.profile_picture && (
                <Box sx={{ width: 120, height: 120, border: '5px solid #f1c40f' }}>
                    <img src={`${API_BASE_URL}${profile.profile_picture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
            )}
        </Box>

        <Box sx={{ p: 6, fontFamily: 'Arial, sans-serif', flexGrow: 1 }}>
            <Box sx={{ mb: 5 }}>
                <EditableText tag="p" text={profile.about_me || "A driven professional..."} isEditing={isEditing} style={{ fontSize: '1.2rem', fontWeight: 500, borderLeft: '5px solid #f1c40f', pl: 3 }} />
            </Box>

            <Grid container spacing={6}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h5" fontWeight="900" sx={{ textTransform: 'uppercase', mb: 3, bgcolor: '#eee', p: 1 }}>Experience</Typography>
                    {profile.placements?.map((p, i) => (
                        <Box key={i} sx={{ mb: 4 }}>
                            <EditableText tag="h3" text={p.role} isEditing={isEditing} style={{ margin: 0, fontSize: '1.3rem' }} />
                            <EditableText tag="div" text={p.company} isEditing={isEditing} style={{ color: '#666', fontWeight: 'bold' }} />
                            <EditableText tag="div" text={p.date_of_joining} isEditing={isEditing} style={{ fontSize: '0.9rem', color: '#999' }} />
                        </Box>
                    ))}

                    <Typography variant="h5" fontWeight="900" sx={{ textTransform: 'uppercase', mb: 3, mt: 5, bgcolor: '#eee', p: 1 }}>Predictions</Typography>
                    {profile.predictions && profile.predictions.length > 0 && (
                        <Box sx={{ border: '2px solid black', p: 2 }}>
                            <Typography variant="caption" fontWeight="bold">AI MATCH</Typography>
                            <EditableText tag="div" text={profile.predictions[0].predicted_roles} isEditing={isEditing} style={{ fontSize: '1.5rem', fontWeight: 'bold' }} />
                        </Box>
                    )}
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h5" fontWeight="900" sx={{ textTransform: 'uppercase', mb: 3, bgcolor: '#eee', p: 1 }}>Stats</Typography>

                    <Box sx={{ mb: 4 }}>
                        <Typography fontWeight="bold" sx={{ mb: 1 }}>EDUCATION</Typography>
                        {profile.education.map((e, i) => (
                            <Box key={i} sx={{ mb: 2 }}>
                                <EditableText tag="div" text={e.university} isEditing={isEditing} style={{ fontWeight: 'bold' }} />
                            </Box>
                        ))}
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography fontWeight="bold" sx={{ mb: 1 }}>SKILLS</Typography>
                        <Box sx={{ lineHeight: 1.8 }}>
                            <EditableText text={profile.skills.map(s => s.skill_name).join(' // ')} isEditing={isEditing} />
                        </Box>
                    </Box>

                    <Box>
                        <Typography fontWeight="bold" sx={{ mb: 1 }}>CERTIFICATIONS</Typography>
                        {profile.certifications?.map((c, i) => (
                            <Box key={i}>- <EditableText text={c.cert_name} isEditing={isEditing} /></Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    </Box>
);

// --- TEMPLATE EXPORTS ---
export const TEMPLATES = [
    { id: 1, name: 'Premium: The Ivy (ATS Safe)', component: TemplateIvy },
    { id: 2, name: 'Premium: Executive', component: TemplateExecutive },
    { id: 3, name: 'Premium: Tech Minimal', component: TemplateMinimalist },
    { id: 11, name: 'Premium: Blue Steel', component: TemplateBlueSteel },
    { id: 12, name: 'Premium: Elegant', component: TemplateElegant },
    { id: 13, name: 'Premium: Bold', component: TemplateBold },
];
