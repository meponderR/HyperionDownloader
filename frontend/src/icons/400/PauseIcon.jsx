import { SvgIcon } from "@mui/material";
import Pause from "@material-symbols/svg-400/outlined/pause_circle-fill.svg?react";

export default function PauseIcon(props) {
    return (
        <SvgIcon {...props}>
            <Pause width="24" height="24" />
        </SvgIcon>
    );
}
