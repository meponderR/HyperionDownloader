import { SvgIcon } from "@mui/material";
import Menu from "@material-symbols/svg-600/outlined/menu-fill.svg?react";

export default function MenuIcon(props) {
    return (
        <SvgIcon {...props}>
            <Menu width="24" height="24" />
        </SvgIcon>
    );
}
