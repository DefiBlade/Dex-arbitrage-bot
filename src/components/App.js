import React, {Component} from 'react';
import { Tab, Col, Row, Nav } from 'react-bootstrap';
import TopNav from './TopNav.js';
import Display from './Display.jsx';
import WalletList  from './WalletList.jsx';
import './App.css'




class App extends Component {
    

    render () {
        return (
            <div>
                <TopNav />

                <Tab.Container id="left-tabs-example" defaultActiveKey="first"><br/><br/>
                    <Row>
                        <Col xs="1">
                            <Nav variant="pills" className="flex-column" bg="light">
                                <Nav.Item>
                                    <Nav.Link  eventKey="first"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-graph-up" viewBox="0 0 16 16">
                                                                <path fillRule="evenodd" d="M0 0h1v15h15v1H0V0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5z"/>
                                                                </svg> &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;   Bot
                                    </Nav.Link>
                                </Nav.Item>
                                <br/><br/>
                                <Nav.Item>
                                    <Nav.Link eventKey="second"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-wallet2" viewBox="0 0 16 16">
                                                                <path d="M12.136.326A1.5 1.5 0 0 1 14 1.78V3h.5A1.5 1.5 0 0 1 16 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-9a1.5 1.5 0 0 1 1.432-1.499L12.136.326zM5.562 3H13V1.78a.5.5 0 0 0-.621-.484L5.562 3zM1.5 4a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z"/>
                                                                </svg>    Token Manage
                                    </Nav.Link> 
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col xs="11" md={{ span: 9 , offset:1 }}>
                            <Tab.Content>
                                <Tab.Pane eventKey="first">
                                     <Display />
                                </Tab.Pane>
                                <Tab.Pane eventKey="second">
                                     <WalletList />
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>
        );
    }
}
export default App;