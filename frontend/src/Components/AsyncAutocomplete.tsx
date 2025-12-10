import React, { useState, useEffect, useMemo } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { debounce } from '@mui/material/utils';
import api from '../api';

interface OptionType {
    label: string;
    value: string;
    isOther?: boolean;
}

interface AsyncAutocompleteProps {
    label: string;
    value: string | null;
    onChange: (value: string | null) => void;
    onInputChange?: (value: string) => void;
    apiEndpoint?: string; // Optional: If provided, fetches from this API
    staticOptions?: string[]; // Optional: Fallback or primary static options
    required?: boolean;
    freeSolo?: boolean;
    name?: string;
}

export default function AsyncAutocomplete({
    label,
    value,
    onChange,
    onInputChange,
    apiEndpoint,
    staticOptions = [],
    required = false,
    freeSolo = true,
}: AsyncAutocompleteProps) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<readonly OptionType[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // Transform static string options to object options
    const normalizedStaticOptions = useMemo(() => {
        const opts = staticOptions.map(opt => ({ label: opt, value: opt }));
        // Always append "Other"
        return [...opts, { label: 'Other', value: 'Other', isOther: true }];
    }, [staticOptions]);

    const fetchOptions = useMemo(
        () =>
            debounce(async (input: string, callback: (results: OptionType[]) => void) => {
                if (!apiEndpoint) {
                    // Filter static options
                    const filtered = normalizedStaticOptions.filter(opt =>
                        opt.label.toLowerCase().includes(input.toLowerCase())
                    );
                    // Ensure "Other" is always present if strict filtering removes it, though typical use case keeps it at bottom
                    // Actually, let's just return normalizedStaticOptions and let Autocomplete filter locally for static
                    // But if we want to simulate API search:
                    callback(filtered);
                    return;
                }

                try {
                    setLoading(true);
                    // Assume API returns a list of strings or objects with 'name'/'label'
                    const response = await api.get(apiEndpoint, { params: { search: input } });
                    const data = response.data;

                    let newOptions: OptionType[] = [];
                    if (Array.isArray(data)) {
                        newOptions = data.map((item: any) => ({
                            label: typeof item === 'string' ? item : (item.name || item.label || ''),
                            value: typeof item === 'string' ? item : (item.id || item.value || item.name || '')
                        }));
                    }

                    // Add Other
                    newOptions.push({ label: 'Other', value: 'Other', isOther: true });
                    callback(newOptions);
                } catch (error) {
                    console.error("Failed to fetch options", error);
                    callback([{ label: 'Other', value: 'Other', isOther: true }]);
                } finally {
                    setLoading(false);
                }
            }, 400),
        [apiEndpoint, normalizedStaticOptions],
    );

    useEffect(() => {
        let active = true;

        if (!open) {
            return undefined;
        }

        // Initial load or search
        setLoading(true);
        fetchOptions(inputValue, (results) => {
            if (active) {
                setLoading(false);
                setOptions(results);
            }
        });

        return () => {
            active = false;
        };
    }, [inputValue, fetchOptions, open]);

    return (
        <Autocomplete
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            freeSolo={freeSolo}
            isOptionEqualToValue={(option, value) => {
                if (typeof value === 'string') return option.label === value;
                return option.label === value.label;
            }}
            getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return option.label;
            }}
            options={options}
            loading={loading}
            value={value}
            onChange={(_, newValue: string | OptionType | null) => {
                if (typeof newValue === 'string') {
                    onChange(newValue);
                } else if (newValue && newValue.isOther) {
                    // If "Other" is selected, clear value to allow typing (if freeSolo) or set to "Other"?
                    // User said "with 'other' option".
                    // If I clear it, they just type.
                    // Let's set it to empty string to trigger required field focus or generic input.
                    onChange("");
                    // Optionally we could focus the input here if needed?
                } else {
                    onChange(newValue ? newValue.value : null);
                }
            }}
            onInputChange={(_, newInputValue) => {
                setInputValue(newInputValue);
                if (onInputChange) onInputChange(newInputValue);
                // Also propogate to onChange if freeSolo for immediate updates
                if (freeSolo) onChange(newInputValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    required={required}
                    fullWidth
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
}
