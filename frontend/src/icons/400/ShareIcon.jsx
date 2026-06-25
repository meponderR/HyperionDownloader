import { SvgIcon } from "@mui/material";
import Share from "@material-symbols/svg-400/outlined/share-fill.svg?react";

export default function ShareIcon(props) {
    return (
        <SvgIcon {...props}>
            <Share width="24" height="24" />
        </SvgIcon>
    );
}
