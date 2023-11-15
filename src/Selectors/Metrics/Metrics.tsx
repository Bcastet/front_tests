import React, {useState} from "react";
import {useAppContext} from "../../context";
import {
    Autocomplete,
    Box,
    Checkbox,
    FormControl,
    TextField,
    Tooltip,
    Chip,
    IconButton,
    ListSubheader,
    CircularProgress
} from "@mui/material";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {AutocompleteProps} from "@mui/material/Autocomplete/Autocomplete";
import {GameMetricsList} from "../../farsight-api";

interface SelectorParams {

}

export function MultipleSelectorGrouped<Option>(props:{
    options:Option[],
    selected:Option[],
    updateSelection: (new_selection : Option[]) => void,
    getOptionLabel: (option: Option) => string,
    getOptionShort: (option: Option) => string,
    getGroup:(option: Option) => string,
    limitTags: number,
    optionDisabled?: (option: Option) => boolean,
    optionDescription?: (option: Option) => string|undefined|null,
    optionIcon?: (option: Option) => Element
}){
    const [selectedGroups, setSelectedGroups] = useState([] as string[]);
    const [openedGroups, setOpenedGroups] = useState([] as string[]);
    const [userTyping, setUserTyping] = useState(false as boolean);
    const [selectedItems, setSelectedItems] = useState([] as Option[]);

    if (!props.options) {
        return <CircularProgress/>;
    }

    const getGroupItems = (group: string) => props.options.filter( (option: Option) => props.getGroup(option) === group );
    const unselectItem = (item: Option) => {
        const new_selection = selectedItems.filter((selectedItem) => item !== selectedItem);
        setSelectedItems(new_selection);
        props.updateSelection(new_selection);
    }
    const selectItem = (item: Option) => {
        if(!selectedItems.includes(item)) setSelectedItems([...selectedItems, item]);
    }

    const setGroupSelection = (event: any, new_group: string) => {
        const group_items = getGroupItems(new_group)
        if(selectedGroups.includes(new_group)){
            const new_groups = selectedGroups.filter(group => group!==new_group);
            setSelectedGroups(new_groups);

            const new_selected_items  = selectedItems.filter(option => !group_items.includes(option))
            setSelectedItems(new_selected_items)
        }else{
            let ng = [...selectedGroups, new_group];
            setSelectedGroups(ng);
            const new_selected_items = [
                ...selectedItems,
                ...group_items.filter(option => !selectedItems.includes(option))
            ]
            setSelectedItems(new_selected_items);
        }
    }

    const setGroupDisplay = (event: any, group: string) => {
        if(!openedGroups.includes(group)) {
            setOpenedGroups([...openedGroups, group]);
        }else{
            setOpenedGroups(openedGroups.filter((value:string) => value !== group))
        }
    }

    return <Autocomplete
        multiple
        disableCloseOnSelect
        options={props.options}
        getOptionLabel={props.getOptionLabel}
        value={selectedItems}
        groupBy={props.getGroup}
        onClose={() => {setUserTyping(false); props.updateSelection(selectedItems);}}
        renderGroup={(params) => {
            const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
            const checkedIcon = <CheckBoxIcon fontSize="small"/>;
            return (
                <Box key={params.group}>
                    <ListSubheader sx={{ cursor: 'pointer' }}>
                        <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            sx={{mr: 1}}
                            checked={ selectedGroups.includes(params.group)}
                            onClick={(event) => setGroupSelection(event, params.group)}
                        />
                        {params.group}
                        <IconButton
                            size="small"
                            onClick={(event) => setGroupDisplay(event, params.group)}
                            sx={{ marginLeft: 'auto' }}
                        >
                            {openedGroups.includes(params.group) ?
                                <ExpandLessIcon/> :
                                <ExpandMoreIcon/>}
                        </IconButton>
                    </ListSubheader>
                    {openedGroups.includes(params.group) || userTyping ? params.children : <></>}
                </Box>
            )}}
        onChange={(event:any, new_value) => {setUserTyping(false); setSelectedItems(new_value);}}
        renderInput={(params: any) => <TextField {...params} label="Metrics" variant="outlined"/>}
        renderOption={(renderOptionProps: any, option: Option, { selected }) => {
            const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
            const checkedIcon = <CheckBoxIcon fontSize="small"/>;
            return <Tooltip title={props.optionDescription ? props.optionDescription(option) : undefined } placement="left">
                <li {...renderOptionProps}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{marginRight: 8}}
                        checked={selected}
                    />
                    {props.getOptionLabel(option)}
                </li>
            </Tooltip>
        }}
        onInputChange={() => setUserTyping(true)}
        getOptionDisabled={option => props.optionDisabled ? props.optionDisabled(option) : false}
        renderTags={(value, getTagProps) => {
            const numTags = value.length;
            return (
                <>
                    {value.slice(0, props.limitTags).map((option, index) => {
                        return (
                            <Chip label={props.getOptionShort(option)} onDelete={() => unselectItem(option)} onClick={() => unselectItem(option)}/>
                        )})}
                    {numTags > props.limitTags && ` +${numTags - props.limitTags}`}
                </>
            );
        }}
        ListboxProps={{className:'scrollable'}}/>
}

export enum targets {
    competitive = "competitive",
    soloq = "soloq",
    scrims = "scrims"
}

export default function NewMetricsSelector(props: {value: string[], updateValue: (newValue: string[]) => void, updateContext:boolean, target:targets}){
    const { metricsReferential, selectedMetrics, setSelectedMetrics} = useAppContext();

    const [localMetrics, setLocalMetrics] = useState(
        metricsReferential.filter((metric) => props.value.includes(metric.code))
    );

    const updateSelection = (newSelection: GameMetricsList[]) => {
        if(props.updateContext){
            setSelectedMetrics(newSelection);
        }else{
            setLocalMetrics(newSelection);
        }
        props.updateValue(newSelection.map((metric) => metric.code));
    }

    return <Box sx={{width:'350px'}}>
        <MultipleSelectorGrouped
            getGroup={(option: GameMetricsList) => option.group ? option.group : 'Other'}
            getOptionLabel={(option: GameMetricsList) => option.label ? option.label : option.code}
            getOptionShort={(option: GameMetricsList) => option._short ? option._short : option.code}
             limitTags={3}
            options={metricsReferential}
            selected={props.updateContext ? selectedMetrics : localMetrics}
            updateSelection={updateSelection}
            optionDisabled={option => option.availableFor ? !option.availableFor.includes(props.target) : false}
            optionDescription={option => option.desc}/>
    </Box>
}