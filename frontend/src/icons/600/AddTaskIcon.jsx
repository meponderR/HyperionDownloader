import { SvgIcon } from "@mui/material";
import AddTask from "@material-symbols/svg-600/outlined/add_task-fill.svg?react";

export default function AddTaskIcon(props) {
    return (
        <SvgIcon {...props}>
            <AddTask width="24" height="24" />
        </SvgIcon>
    );
}
