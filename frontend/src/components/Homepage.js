import React from 'react';

import {
    Container,
    Row,
    Col,
    Form,
    Button
} from 'react-bootstrap';
import bsCustomFileInput from 'bs-custom-file-input'

import wallpaper from '../assets/images/wallpaper.jpg';

export default function Homepage() {

    return(
        <Container>
            <img src={wallpaper} id="wallpaper_img" alt="wallpaper"></img>
            <Row>
                <Col>
                    <Workpanel/>
                </Col>
            </Row>
        </Container>
    )
}

export const Workpanel = (props) => {
    let [ imageFile, setImageFile ] = React.useState(null);
    let [ width, setWidth ] = React.useState(0);
    let [ height, setHeight ] = React.useState(0);

    let [ coordinates, setCoordinates ] = React.useState({x:0, y:0});

    let [ mouseIsDown, setMouseIsDown ] = React.useState(false);
    let [ initialCoordinates, setInitialCoordinates ] = React.useState({x:0, y:0})

    let [ boxes, setBoxes ] = React.useState([]);
    let [ selectedBox, setSelectedBox ] = React.useState(null);
    // let [ boxes, setBoxes ] = React.useState([{x:10, y:10, width:40, height:70, class:"dog"}]); 

    /*
        prediction:[
            {
                x:
                y:
                width:
                height:
                class:
            },...
        ]
    */

    let canvasRef = React.useRef();
    let imageRef = React.useRef();

    React.useEffect(() => {
        bsCustomFileInput.init()
    }, []);

    // const svgMouseMove = (e) => {
    //     let rect = e.target.getBoundingClientRect()
    //     let x = parseInt(e.clientX - rect.left);
    //     let y = parseInt(e.clientY - rect.top);

    //     setCoordinates({x:x,y:y})
    // }

    const canvasMouseMove = (e) => {
        setCoordinates(getCoordinates(e))
    }

    const canvasMouseDown = (e) => {
        setInitialCoordinates(getCoordinates(e))
        setMouseIsDown(true);
    }

    const canvasMouseUp = (e) => {
        // check, if no drag = mouseclick
        let threshold = 10;
        if(Math.abs(coordinates.x - initialCoordinates.x) + Math.abs(coordinates.y - initialCoordinates.y) < threshold){
            canvasMouseClick(e);
            setMouseIsDown(false);
            setSelectedBox(calculateSelection(coordinates, boxes));
            return;
        }

        let temp = [...boxes];
        
        temp.push({
            x: (coordinates.x - initialCoordinates.x < 0) ? (coordinates.x) : (initialCoordinates.x), 
            y: (coordinates.y - initialCoordinates.y < 0) ? (coordinates.y) : (initialCoordinates.y),
            width: Math.abs(coordinates.x - initialCoordinates.x),
            height: Math.abs(coordinates.y - initialCoordinates.y),
            label: ""
        })
        setBoxes(temp);
        setMouseIsDown(false);
        setSelectedBox(temp.length -1);
    }

    const canvasMouseOut = (e) => {
        setCoordinates({x:0,y:0});
        setMouseIsDown(false);
    }

    const canvasMouseClick = (e) => {

    }

    const onImageLoad = (e) => {
        setWidth(e.target.width);
        setHeight(e.target.height);
    }

    React.useEffect(() => {
        let context = canvasRef.current.getContext("2d");

        context.clearRect(0,0, canvasRef.current.width, canvasRef.current.height);
        context.drawImage(
            imageRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height
        )

        drawBoxes(canvasRef.current, boxes);

        if(selectedBox !== null){
            drawSelectedBox(canvasRef.current, boxes[selectedBox]);
        }

        if(mouseIsDown){
            
            context.beginPath();
            context.strokeStyle = 'red';
            context.strokeRect(initialCoordinates.x, initialCoordinates.y, coordinates.x - initialCoordinates.x, coordinates.y - initialCoordinates.y);
        }

        drawCrosshair(canvasRef.current, coordinates);

    }, [imageFile, boxes, coordinates, initialCoordinates, mouseIsDown, selectedBox]);

    const drawCrosshair = (target, coordinates) => {
        let context = target.getContext("2d");

        context.beginPath();

        context.strokeWidth = 1; 
        context.strokeStyle = 'black';

        context.moveTo(coordinates.x, 0);
        context.lineTo(coordinates.x, target.height);
        context.moveTo(0,  coordinates.y);
        context.lineTo(target.width,  coordinates.y);

        context.stroke();
    }

    const drawBoxes = (target, boxes) => {
        let context = target.getContext("2d");

        context.beginPath();

        context.strokeStyle = 'blue';

        for(let i = 0; i < boxes.length; i++){
            if(boxes[i].label !== ""){
                const font = "10px sans-serif";
                context.font = font;
                context.textBaseline = "top";
    
                // Label background
                context.fillStyle = "#00FFFF";
                const textWidth = context.measureText(boxes[i].label).width;
                const textHeight = parseInt(font, 10); // base 10
                context.fillRect(boxes[i].x, boxes[i].y, textWidth + 4, textHeight + 4);
    
                // Labels
                context.fillStyle = "#000000";
                context.fillText(boxes[i].label, boxes[i].x + 2, boxes[i].y + 2);
            }

            context.strokeRect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
        }
    }

    const drawSelectedBox = (target, box) => {
        let context = target.getContext("2d");

        context.beginPath();
        context.strokeStyle = 'lawngreen';

        context.strokeRect(box.x, box.y, box.width, box.height);
    }

    const getCoordinates = (e) => {
        let rect = e.target.getBoundingClientRect()
        let x = parseInt(e.clientX - rect.left);
        let y = parseInt(e.clientY - rect.top);
        let coordinates = {x:x,y:y}
        return coordinates;
    }

    const calculateSelection = (coordinates, boxes) => {
        for(let i = 0; i < boxes.length; i++){
            if(
                coordinates.x >= boxes[i].x &&
                coordinates.x <= boxes[i].x + boxes[i].width &&
                coordinates.y >= boxes[i].y &&
                coordinates.y <= boxes[i].y + boxes[i].height
            ){
                return i;
            }
        }

        return null;
    }

    const updateLabel = (i, label) => {
        let temp = [...boxes];

        temp[i].label = label;
        setBoxes(temp);
    }

    const deleteBox = (i) => {
        let temp = [...boxes];

        temp.splice(i, 1);
        setBoxes(temp);
        setSelectedBox(null);
    }

    const onChangeFile = (e) => {
        if(e.target.files && e.target.files.length){
            setImageFile(e.target.files[0]);
        }
    }

    return(
    <>
        {/* <svg className="border" onMouseMove={(e) => { svgMouseMove(e)}} width={width} height={height}>
            <line x1={coordinates.x} x2={coordinates.x} y1="0" y2={height} style={{stroke:"black"}}></line>
            <line x1={0} x2={width} y1={coordinates.y} y2={coordinates.y} style={{stroke:"black"}}></line>
        </svg> */}
        <Container>
            <Row>
                <Col md="6">
                    <img className="draw_image" ref={imageRef} alt="temp" style={{width:"100%"}}
                        src={(imageFile === null) ? ("") : (URL.createObjectURL(imageFile))}
                        onLoad={(e) => {onImageLoad(e)}}
                    />
                    <canvas ref={canvasRef} className="border" width={width} height={height}
                        onMouseMove={(e) => {canvasMouseMove(e)}}
                        onMouseDown={(e) => {canvasMouseDown(e)}}
                        onMouseUp={(e) => {canvasMouseUp(e)}}
                        onMouseOut={(e) => {canvasMouseOut(e)}}
                    />
                </Col>
                <Col md="6">
                    {
                        (selectedBox !== null) ? (
                            <Form>
                                <Form.Group as={Col} xs="12" md="6">
                                    <Form.Label>Label</Form.Label>
                                    <Form.Control as="select" value={boxes[selectedBox].label} onChange={(e) => {updateLabel(selectedBox, e.target.value)}}>
                                        <option value=""></option>
                                        <option value="Cat">Cat</option>
                                        <option value="Dog">Dog</option>    
                                        <option value="Fish">Fish</option>    
                                    </Form.Control>
                                    <Button onClick={() => {deleteBox(selectedBox)}}>Delete</Button>
                                </Form.Group>
                            </Form>
                        ) : ("")
                    }
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form>
                        <Form.File label="upload image" custom onChange={(e) => {onChangeFile(e)}}/>
                    </Form>
                </Col>
            </Row>
        </Container>
    </>
    )
}
