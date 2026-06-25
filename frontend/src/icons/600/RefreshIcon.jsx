import { SvgIcon } from "@mui/material";
import Refresh from "@material-symbols/svg-600/outlined/refresh.svg?react";

export default function RefreshIcon(props) {
    return (
        <SvgIcon {...props}>
            <Refresh width="24" height="24" />
        </SvgIcon>
    );
}
