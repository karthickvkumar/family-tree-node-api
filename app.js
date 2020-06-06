const express = require('express');
const app = express();
const Joi = require('@hapi/joi');
app.use(express.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
    express.json();
});

let nodeList = [
    {
        id: 'group-1',
        name: 'Ben',
        role: 'Father',
        color: 'blue',
        left: 100,
        top: 30,
        child: []
    },
    {
        id: 'group-2',
        name: 'Peter',
        role: 'Father',
        color: 'black',
        left: 400,
        top: 30,
        child: [
            {
                id: 'group-3',
                parentId: 'group-2',
                name: 'John',
                role: 'Son',
                color: 'orange',
                child: []
            },
            {
                id: 'group-4',
                parentId: 'group-2',
                name: 'Freda',
                role: 'Daughter',
                color: 'pink',
                child: []
            }
        ]
    }
];

app.get('/api/status', (req, res) => {
    res.send('Server is Up and Running')
});

app.get('/api/nodes', (req, res) => {
    res.send(nodeList);
});

app.post('/api/node/add', (req, res) => {
    let { error } = validate(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }
    let newNode = {
        id: req.body.id,
        parentId: req.body.parentId,
        name: req.body.name,
        role: req.body.role,
        color: req.body.color
    }
    let parentNode = findTargetNode(newNode.parentId);
    if (parentNode) {
        parentNode.child.push(newNode);
        res.send(parentNode);
    }
});

app.put('/api/node/edit/:id', (req, res) => {
    let node = findTargetNode(req.params.id);
    console.log(node)
    if (!node) {
        res.status(400).send('The node with given ID is not Found');
        return;
    }
    let { error } = validate(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }
    node.name = req.body.name;
    node.role = req.body.role;
    node.color = req.body.color;
    res.send(node);
});

function findTargetNode(id) {
    const iterateFind = (childNode) => {
        return childNode.find((child) => {
            if (child.id == id) {
                return child
            }
            if (childNode.id !== id && childNode.child instanceof Array && childNode.child.length > 0) {
                return iterateFind(childNode.child);
            }
        });
    }

    let targetNode = [];
    nodeList.forEach((node) => {
        if (node.id == id) {
            targetNode.push(node);
        }
        if (node.id !== id && node.child instanceof Array && node.child.length > 0) {
            targetNode.push(iterateFind(node.child));
        }
    });
    return targetNode.length > 0 ? targetNode[0] : targetNode;
};

function validate(node) {
    const schema = Joi.object({
        name: Joi.string()
            .min(3)
            .required(),
        id: Joi.string()
            .min(3)
            .required(),
        parentId: Joi.string()
            .min(3)
            .required(),
        role: Joi.string()
            .min(3)
            .required(),
        color: Joi.string()
            .min(1)
            .required()
    });
    return schema.validate(node);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT);