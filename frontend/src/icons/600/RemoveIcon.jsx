import { SvgIcon } from "@mui/material";
import Remove from "@material-symbols/svg-600/outlined/remove-fill.svg?react";

export default function RemoveIcon(props) {
    return (
        <SvgIcon {...props}>
            <Remove width="24" height="24" />
        </SvgIcon>
    );
}
