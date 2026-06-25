import { SvgIcon } from "@mui/material";
import Close from "@material-symbols/svg-400/outlined/close-fill.svg?react";

export default function CloseIcon(props) {
    return (
        <SvgIcon {...props}>
            <Close width="24" height="24" />
        </SvgIcon>
    );
}
