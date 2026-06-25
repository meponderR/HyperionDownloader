import { SvgIcon } from "@mui/material";
import Cancel from "@material-symbols/svg-400/outlined/cancel-fill.svg?react";

export default function CancelIcon(props) {
    return (
        <SvgIcon {...props}>
            <Cancel width="24" height="24" />
        </SvgIcon>
    );
}
