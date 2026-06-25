import { SvgIcon } from "@mui/material";
import TasksAlt from "@material-symbols/svg-400/outlined/task_alt-fill.svg?react";

export default function TasksAltIcon(props) {
    return (
        <SvgIcon {...props}>
            <TasksAlt width="24" height="24" />
        </SvgIcon>
    );
}
