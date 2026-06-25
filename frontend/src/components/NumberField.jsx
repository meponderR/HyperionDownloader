import * as React from "react";
import PropTypes from "prop-types";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import KeyboardArrowUpIcon from "../icons/400/KeyboardArrowUpIcon";
import KeyboardArrowDownIcon from "../icons/400/KeyboardArrowDownIcon";
import { FilledInput, Typography } from "@mui/material";

/**
 * This component is a placeholder for FormControl to correctly set the shrink label state on SSR.
 */
function SSRInitialFilled(_) {
    return null;
}
SSRInitialFilled.muiName = "Input";

function NumberField({
    id: idProp,
    label,
    error,
    size = "medium",
    endAdornment = "",
    fullWidth,
    variant = "filled",
    ...other
}) {
    let id = React.useId();
    if (idProp) {
        id = idProp;
    }
    return (
        <BaseNumberField.Root
            {...other}
            render={(props, state) => (
                <FormControl
                    size={size}
                    fullWidth={fullWidth}
                    ref={props.ref}
                    disabled={state.disabled}
                    required={state.required}
                    error={error}
                    variant={variant}
                >
                    {props.children}
                </FormControl>
            )}
        >
            <SSRInitialFilled {...other} />
            <InputLabel htmlFor={id}>{label}</InputLabel>
            <BaseNumberField.Input
                id={id}
                render={(props, state) => (
                    <FilledInput
                        aria-describedby={`${id}-helper-text`}
                        label={label}
                        inputRef={props.ref}
                        value={state.inputValue}
                        onBlur={props.onBlur}
                        onChange={props.onChange}
                        onKeyUp={props.onKeyUp}
                        onKeyDown={props.onKeyDown}
                        onFocus={props.onFocus}
                        slotProps={{
                            input: props,
                        }}
                        endAdornment={
                            <React.Fragment>
                                <InputAdornment>
                                    <Typography variant="body2" color="text.secondary" sx={{ pr: 1 }}>
                                        {endAdornment}
                                    </Typography>
                                </InputAdornment>
                                <InputAdornment
                                    position="end"
                                    sx={{
                                        flexDirection: "column",
                                        maxHeight: "unset",
                                        alignSelf: "stretch",
                                        borderLeft: "1px solid",
                                        borderColor: "divider",
                                        ml: 0,
                                        "& button": {
                                            py: 0,
                                            flex: 1,
                                            borderRadius: 0.5,
                                        },
                                    }}
                                >
                                    <BaseNumberField.Increment
                                        render={<IconButton size={size} aria-label="Increase" />}
                                    >
                                        <KeyboardArrowUpIcon fontSize={size} sx={{ transform: "translateY(2px)" }} />
                                    </BaseNumberField.Increment>

                                    <BaseNumberField.Decrement
                                        render={<IconButton size={size} aria-label="Decrease" />}
                                    >
                                        <KeyboardArrowDownIcon fontSize={size} sx={{ transform: "translateY(-2px)" }} />
                                    </BaseNumberField.Decrement>
                                </InputAdornment>
                            </React.Fragment>
                        }
                        sx={{ pr: 0 }}
                    />
                )}
            />
        </BaseNumberField.Root>
    );
}

NumberField.propTypes = {
    error: PropTypes.bool,
    /**
     * The id of the input element.
     */
    id: PropTypes.string,
    label: PropTypes.node,
    size: PropTypes.oneOf(["medium", "small"]),
    endAdornment: PropTypes.string,
    fullWidth: PropTypes.bool,
    variant: PropTypes.oneOf(["filled", "outlined", "standard"]),
};

export default NumberField;
