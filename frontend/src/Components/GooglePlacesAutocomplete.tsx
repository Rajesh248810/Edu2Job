import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { debounce } from '@mui/material/utils';

// This script expects the Google Maps API to be loaded in index.html with libraries=places

interface MainTextMatchedSubstrings {
    offset: number;
    length: number;
}
interface StructuredFormatting {
    main_text: string;
    secondary_text: string;
    main_text_matched_substrings?: readonly MainTextMatchedSubstrings[];
}
interface PlaceType {
    description: string;
    structured_formatting: StructuredFormatting;
}

interface GooglePlacesAutocompleteProps {
    value: string | null;
    onChange: (newValue: string | null) => void;
    onInputChange: (newInputValue: string) => void;
    label?: string;
    required?: boolean;
}

export default function GooglePlacesAutocomplete({
    value,
    onChange,
    onInputChange,
    label = "University / Institution",
    required = false
}: GooglePlacesAutocompleteProps) {
    const [inputValue, setInputValue] = React.useState('');
    const [options, setOptions] = React.useState<readonly PlaceType[]>([]);

    const autocompleteService = React.useRef<any>(null);

    const fetch = React.useMemo(
        () =>
            debounce(
                (
                    request: { input: string },
                    callback: (results?: readonly PlaceType[]) => void,
                ) => {
                    if (!autocompleteService.current && (window as any).google) {
                        autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
                    }

                    if (!autocompleteService.current) {
                        return;
                    }

                    autocompleteService.current.getPlacePredictions(
                        { ...request, types: ['university', 'school'] },
                        (results?: readonly PlaceType[]) => {
                            if (results) {
                                callback(results);
                            } else {
                                callback([]);
                            }

                        },
                    );
                },
                400,
            ),
        [],
    );

    React.useEffect(() => {
        let active = true;

        if (inputValue === '') {
            setOptions(value ? [{ description: value, structured_formatting: { main_text: value, secondary_text: '' } } as any] : []);
            return undefined;
        }

        fetch({ input: inputValue }, (results?: readonly PlaceType[]) => {
            if (active) {
                let newOptions: readonly PlaceType[] = [];

                if (value) {
                    newOptions = [{ description: value, structured_formatting: { main_text: value, secondary_text: '' } } as any];
                }

                if (results) {
                    newOptions = [...newOptions, ...results];
                }

                setOptions(newOptions);
            }
        });

        return () => {
            active = false;
        };
    }, [value, inputValue, fetch]);

    return (
        <Autocomplete
            id="google-map-demo"
            getOptionLabel={(option) => typeof option === 'string' ? option : option.description}
            filterOptions={(x) => x}
            options={options}
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={value ? { description: value } as any : null}
            freeSolo
            onChange={(_, newValue: PlaceType | null | string) => {
                setOptions(newValue ? [newValue as PlaceType, ...options] : options);
                if (typeof newValue === 'string') {
                    onChange(newValue);
                } else {
                    onChange(newValue ? newValue.description : null);
                }
            }}
            onInputChange={(_, newInputValue) => {
                setInputValue(newInputValue);
                onInputChange(newInputValue);
            }}
            renderInput={(params) => (
                <TextField {...params} label={label} fullWidth required={required} />
            )}
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                const matches =
                    option.structured_formatting.main_text_matched_substrings || [];

                const parts = parse(
                    option.structured_formatting.main_text,
                    matches.map((match: any) => [match.offset, match.offset + match.length]),
                );

                return (
                    <li key={key} {...optionProps}>
                        <Grid container alignItems="center">
                            <Grid sx={{ display: 'flex', width: 44 }}>
                                <LocationOnIcon sx={{ color: 'text.secondary' }} />
                            </Grid>
                            <Grid sx={{ width: 'calc(100% - 44px)', wordWrap: 'break-word' }}>
                                {parts.map((part, index) => (
                                    <Typography
                                        key={index}
                                        component="span"
                                        variant="body2"
                                        color={part.highlight ? 'text.primary' : 'text.secondary'}
                                        fontWeight={part.highlight ? 'bold' : 'regular'}
                                    >
                                        {part.text}
                                    </Typography>
                                ))}
                                <Typography variant="body2" color="text.secondary">
                                    {option.structured_formatting.secondary_text}
                                </Typography>
                            </Grid>
                        </Grid>
                    </li>
                );
            }}
        />
    );
}

function parse(text: string, matches: [number, number][]) {
    const result = [];
    let error = false;
    if (matches.length > 0) {
        matches.sort((a, b) => a[0] - b[0]);
        let currentPosition = 0;
        for (const match of matches) {
            const [start, end] = match;
            if (start < currentPosition) {
                error = true;
                break;
            }
            if (start > currentPosition) {
                result.push({
                    text: text.substring(currentPosition, start),
                    highlight: false,
                });
            }
            result.push({
                text: text.substring(start, end),
                highlight: true,
            });
            currentPosition = end;
        }
        if (currentPosition < text.length) {
            result.push({
                text: text.substring(currentPosition),
                highlight: false,
            });
        }

    } else {
        result.push({ text: text, highlight: false });
    }
    if (error) return [{ text: text, highlight: false }];

    return result;
}
