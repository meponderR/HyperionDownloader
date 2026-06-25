import { SvgIcon } from "@mui/material";
import Info from "@material-symbols/svg-400/outlined/info-fill.svg?react";

export default function InfoIcon(props) {
    return (
        <SvgIcon {...props}>
            <Info width="24" height="24" />
        </SvgIcon>
    );
}
