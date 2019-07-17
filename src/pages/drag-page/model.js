import {appendChild, addChild, deleteNode, updateNode, findParentById, findNodeById} from './utils';
import {cloneDeep} from 'lodash';
import update from "immutability-helper";

export default {
    initialState: {
        // 所有页面配置数据，持久化的，从数据库中来。
        pageConfig: {
            __type: 'PageContent', // 节点组件类型
            __id: '1', // 节点的唯一标识
            children: [
                {
                    __type: 'ToolBar',
                    __id: '11',
                    children: [
                        {
                            __type: 'Button',
                            __id: '111',
                            children: [
                                {
                                    __type: 'text',
                                    __id: '1111',
                                    content: '默认按钮',
                                }
                            ],
                        },
                        {
                            __type: 'ButtonPrimary',
                            __id: '112',
                            type: 'primary',
                            children: [
                                {
                                    __type: 'text',
                                    __id: '1121',
                                    content: '主按钮',
                                }
                            ],
                        },
                        {
                            __type: 'ButtonDanger',
                            __id: '113',
                            type: 'danger',
                            children: [
                                {
                                    __type: 'text',
                                    __id: '1131',
                                    content: '危险按钮',
                                }
                            ],
                        },
                    ],
                },
                {
                    __type: 'div',
                    __id: '12',
                    children: [
                        {
                            __type: 'text', // 临时容器，元素投放使用，不实际渲染成节点
                            __id: '121',
                            content: '文字节点内容',
                        },
                    ],
                },
            ],
        },
        currentId: null, // 当前点击选中的元素id
        currentNode: null,
        showGuideLine: true, // 是否显示辅助线
    },

    setProps: ({targetId, props}, state) => {
        const config = cloneDeep(state.pageConfig);
        const node = findNodeById(config, targetId);
        const {__id, __type, __level, children} = node;

        updateNode(config, {__id, __type, __level, children, ...props});

        return {pageConfig: config};
    },

    setGuideLine: showGuideLine => ({showGuideLine}),

    setCurrentId: (currentId, state) => {
        const currentNode = cloneDeep(findNodeById(state.pageConfig, currentId));
        return {currentId, currentNode};
    },

    setPageConfigs: (pageConfig) => ({pageConfig}),

    appendChild: ({targetId, child}, state) => {
        const config = cloneDeep(state.pageConfig);

        appendChild(config, targetId, cloneDeep(child));

        return {pageConfig: config};
    },

    addChild: ({targetId, childIndex, child}, state) => {
        const config = cloneDeep(state.pageConfig);

        addChild(config, targetId, childIndex, cloneDeep(child));

        return {pageConfig: config};
    },

    deleteNode: (targetId, state) => {
        const config = cloneDeep(state.pageConfig);

        deleteNode(config, targetId);

        return {pageConfig: config};
    },

    deleteNodeAndSelectOther: (targetId, state) => {
        const config = cloneDeep(state.pageConfig);
        const parentNode = findParentById(config, targetId);

        deleteNode(config, targetId);

        // 选中下一个节点
        let currentId = null;

        if (parentNode) {
            if (parentNode.children && parentNode.children.length) {
                currentId = parentNode.children[parentNode.children.length - 1].__id;
            } else {
                currentId = parentNode.__id;
            }
        }

        return {pageConfig: config, currentId};
    },

    updateNode: (node, state) => {
        const config = cloneDeep(state.pageConfig);

        updateNode(config, cloneDeep(node));

        return {pageConfig: config};
    },

    setContent: ({targetId, content}, state) => {
        const config = cloneDeep(state.pageConfig);
        const node = findNodeById(config, targetId);

        if (node && node.children && node.children.length === 1 && node.children[0].__type === 'text') {
            node.children[0].content = content;

            return {pageConfig: config};
        }
    },

    sort: ({dragId, hoverId}, state) => {
        const config = cloneDeep(state.pageConfig);

        const parentNode = findParentById(config, hoverId);
        let children = parentNode.children;
        const dragIndex = children.findIndex(item => item.__id === dragId);
        const dropIndex = children.findIndex(item => item.__id === hoverId);
        const dragCard = children[dragIndex];

        children = update(children, {
            $splice: [[dragIndex, 1], [dropIndex, 0, dragCard]],
        });

        parentNode.children = children;

        return {pageConfig: config};
    },
}