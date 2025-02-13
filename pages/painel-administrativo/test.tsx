import React, { useState, useEffect, useMemo } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const initialRows = [
    {
        id: 0,
        items: [
            { id: '1', content: 'Item 1' },
            { id: '2', content: 'Item 2' },
            { id: '3', content: 'Item 3' },
            { id: '4', content: 'Item 4' },
            { id: '5', content: 'Item 5' },
        ]
    },
    {
        id: 1,
        items: [
            { id: '6', content: 'Item 6' },
            { id: '7', content: 'Item 7' },
            { id: '8', content: 'Item 8' },
            { id: '9', content: 'Item 9' },
            { id: '10', content: 'Item 10' },
        ]
    },
    {
        id: 2,
        items: [
            { id: '11', content: 'Item 11' },
            { id: '12', content: 'Item 12' },
            { id: '13', content: 'Item 13' },
            { id: '14', content: 'Item 14' },
            { id: '15', content: 'Item 15' },
        ]
    },
];

export default function Test() {
    const [rows, setRows] = useState(initialRows);



    const onDragEnd = (result) => {
        const { source, destination } = result;

        // If no destination or same position, do nothing
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
            return;
        }

        const updatedRows = [...rows];
        const sourceRow = updatedRows.find(row => row.id === source.droppableId);
        const destRow = updatedRows.find(row => row.id === destination.droppableId);

        // Remove the dragged item from the source row
        const draggedItem = sourceRow.items.splice(source.index, 1)[0];



        // Insert the dragged item into the destination row
        destRow.items.splice(destination.index, 0, draggedItem);

        for (let i = 0; i < updatedRows.length; i++) {
            if (updatedRows[i].items.length < 5) {
                const lastItem = updatedRows[i + 1].items.shift();
                updatedRows[i].items.push(lastItem);
            }
            if (updatedRows[i].items.length > 5) {
                const lastItem = updatedRows[i].items.pop(); // Remove last item from destination row
                updatedRows[i + 1].items.unshift(lastItem);
            }
        }
        // Update state with the new rows configuration
        setRows(updatedRows);
    };

    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            

        </div>
    );
}