import { SvgIcon } from "@mui/material";
import Delete from "@material-symbols/svg-400/outlined/delete-fill.svg?react";

export default function DeleteIcon(props) {
    return (
        <SvgIcon {...props}>
            <Delete width="24" height="24" />
        </SvgIcon>
    );
}
