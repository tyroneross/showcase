type ContentBlock = {
    type: "text";
    text: string;
} | {
    type: "image";
    data: string;
    mimeType: string;
};
export declare const TOOLS: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            target: {
                type: string;
                description: string;
            };
            viewport: {
                type: string;
                enum: string[];
                description: string;
            };
            selector: {
                type: string;
                description: string;
            };
            full_page: {
                type: string;
                description: string;
            };
            title: {
                type: string;
                description: string;
            };
            feature: {
                type: string;
                description: string;
            };
            component: {
                type: string;
                description: string;
            };
            tags: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            duration?: undefined;
            tags_any?: undefined;
            platform?: undefined;
            type?: undefined;
            starred?: undefined;
            since?: undefined;
            query?: undefined;
            limit?: undefined;
            id?: undefined;
            add_tags?: undefined;
            remove_tags?: undefined;
            group_by?: undefined;
            ids?: undefined;
            output_dir?: undefined;
            format?: undefined;
            manifest?: undefined;
            steps?: undefined;
            step_delay?: undefined;
        };
        required: string[];
    };
    annotations: {
        title: string;
        readOnlyHint: boolean;
        destructiveHint: boolean;
        idempotentHint: boolean;
        openWorldHint: boolean;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            target: {
                type: string;
                description: string;
            };
            duration: {
                type: string;
                description: string;
            };
            viewport: {
                type: string;
                enum: string[];
                description: string;
            };
            title: {
                type: string;
                description: string;
            };
            feature: {
                type: string;
                description: string;
            };
            component: {
                type: string;
                description: string;
            };
            tags: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            selector?: undefined;
            full_page?: undefined;
            tags_any?: undefined;
            platform?: undefined;
            type?: undefined;
            starred?: undefined;
            since?: undefined;
            query?: undefined;
            limit?: undefined;
            id?: undefined;
            add_tags?: undefined;
            remove_tags?: undefined;
            group_by?: undefined;
            ids?: undefined;
            output_dir?: undefined;
            format?: undefined;
            manifest?: undefined;
            steps?: undefined;
            step_delay?: undefined;
        };
        required: string[];
    };
    annotations: {
        title: string;
        readOnlyHint: boolean;
        destructiveHint: boolean;
        idempotentHint: boolean;
        openWorldHint: boolean;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            tags: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            tags_any: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            feature: {
                type: string;
                description: string;
            };
            component: {
                type: string;
                description: string;
            };
            platform: {
                type: string;
                enum: string[];
                description: string;
            };
            type: {
                type: string;
                enum: string[];
                description: string;
            };
            starred: {
                type: string;
                description: string;
            };
            since: {
                type: string;
                description: string;
            };
            query: {
                type: string;
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
            target?: undefined;
            viewport?: undefined;
            selector?: undefined;
            full_page?: undefined;
            title?: undefined;
            duration?: undefined;
            id?: undefined;
            add_tags?: undefined;
            remove_tags?: undefined;
            group_by?: undefined;
            ids?: undefined;
            output_dir?: undefined;
            format?: undefined;
            manifest?: undefined;
            steps?: undefined;
            step_delay?: undefined;
        };
        required?: undefined;
    };
    annotations: {
        title: string;
        readOnlyHint: boolean;
        destructiveHint: boolean;
        idempotentHint: boolean;
        openWorldHint: boolean;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            id: {
                type: string;
                description: string;
            };
            add_tags: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            remove_tags: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            title: {
                type: string;
                description: string;
            };
            feature: {
                type: string;
                description: string;
            };
            component: {
                type: string;
                description: string;
            };
            starred: {
                type: string;
                description: string;
            };
            target?: undefined;
            viewport?: undefined;
            selector?: undefined;
            full_page?: undefined;
            tags?: undefined;
            duration?: undefined;
            tags_any?: undefined;
            platform?: undefined;
            type?: undefined;
            since?: undefined;
            query?: undefined;
            limit?: undefined;
            group_by?: undefined;
            ids?: undefined;
            output_dir?: undefined;
            format?: undefined;
            manifest?: undefined;
            steps?: undefined;
            step_delay?: undefined;
        };
        required: string[];
    };
    annotations: {
        title: string;
        readOnlyHint: boolean;
        destructiveHint: boolean;
        idempotentHint: boolean;
        openWorldHint: boolean;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            group_by: {
                type: string;
                enum: string[];
                description: string;
            };
            target?: undefined;
            viewport?: undefined;
            selector?: undefined;
            full_page?: undefined;
            title?: undefined;
            feature?: undefined;
            component?: undefined;
            tags?: undefined;
            duration?: undefined;
            tags_any?: undefined;
            platform?: undefined;
            type?: undefined;
            starred?: undefined;
            since?: undefined;
            query?: undefined;
            limit?: undefined;
            id?: undefined;
            add_tags?: undefined;
            remove_tags?: undefined;
            ids?: undefined;
            output_dir?: undefined;
            format?: undefined;
            manifest?: undefined;
            steps?: undefined;
            step_delay?: undefined;
        };
        required?: undefined;
    };
    annotations: {
        title: string;
        readOnlyHint: boolean;
        destructiveHint: boolean;
        idempotentHint: boolean;
        openWorldHint: boolean;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            ids: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            feature: {
                type: string;
                description: string;
            };
            tags: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            starred: {
                type: string;
                description: string;
            };
            output_dir: {
                type: string;
                description: string;
            };
            format: {
                type: string;
                enum: string[];
                description: string;
            };
            manifest: {
                type: string;
                description: string;
            };
            target?: undefined;
            viewport?: undefined;
            selector?: undefined;
            full_page?: undefined;
            title?: undefined;
            component?: undefined;
            duration?: undefined;
            tags_any?: undefined;
            platform?: undefined;
            type?: undefined;
            since?: undefined;
            query?: undefined;
            limit?: undefined;
            id?: undefined;
            add_tags?: undefined;
            remove_tags?: undefined;
            group_by?: undefined;
            steps?: undefined;
            step_delay?: undefined;
        };
        required?: undefined;
    };
    annotations: {
        title: string;
        readOnlyHint: boolean;
        destructiveHint: boolean;
        idempotentHint: boolean;
        openWorldHint: boolean;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            target?: undefined;
            viewport?: undefined;
            selector?: undefined;
            full_page?: undefined;
            title?: undefined;
            feature?: undefined;
            component?: undefined;
            tags?: undefined;
            duration?: undefined;
            tags_any?: undefined;
            platform?: undefined;
            type?: undefined;
            starred?: undefined;
            since?: undefined;
            query?: undefined;
            limit?: undefined;
            id?: undefined;
            add_tags?: undefined;
            remove_tags?: undefined;
            group_by?: undefined;
            ids?: undefined;
            output_dir?: undefined;
            format?: undefined;
            manifest?: undefined;
            steps?: undefined;
            step_delay?: undefined;
        };
        required?: undefined;
    };
    annotations: {
        title: string;
        readOnlyHint: boolean;
        destructiveHint: boolean;
        idempotentHint: boolean;
        openWorldHint: boolean;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            id: {
                type: string;
                description: string;
            };
            target?: undefined;
            viewport?: undefined;
            selector?: undefined;
            full_page?: undefined;
            title?: undefined;
            feature?: undefined;
            component?: undefined;
            tags?: undefined;
            duration?: undefined;
            tags_any?: undefined;
            platform?: undefined;
            type?: undefined;
            starred?: undefined;
            since?: undefined;
            query?: undefined;
            limit?: undefined;
            add_tags?: undefined;
            remove_tags?: undefined;
            group_by?: undefined;
            ids?: undefined;
            output_dir?: undefined;
            format?: undefined;
            manifest?: undefined;
            steps?: undefined;
            step_delay?: undefined;
        };
        required: string[];
    };
    annotations: {
        title: string;
        readOnlyHint: boolean;
        destructiveHint: boolean;
        idempotentHint: boolean;
        openWorldHint: boolean;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            target: {
                type: string;
                description: string;
            };
            steps: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        action: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        selector: {
                            type: string;
                            description: string;
                        };
                        text: {
                            type: string;
                            description: string;
                        };
                        value: {
                            type: string;
                            description: string;
                        };
                        url: {
                            type: string;
                            description: string;
                        };
                        duration: {
                            type: string;
                            description: string;
                        };
                        y: {
                            type: string;
                            description: string;
                        };
                        title: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
            };
            viewport: {
                type: string;
                enum: string[];
                description: string;
            };
            step_delay: {
                type: string;
                description: string;
            };
            title: {
                type: string;
                description: string;
            };
            feature: {
                type: string;
                description: string;
            };
            component: {
                type: string;
                description: string;
            };
            tags: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            selector?: undefined;
            full_page?: undefined;
            duration?: undefined;
            tags_any?: undefined;
            platform?: undefined;
            type?: undefined;
            starred?: undefined;
            since?: undefined;
            query?: undefined;
            limit?: undefined;
            id?: undefined;
            add_tags?: undefined;
            remove_tags?: undefined;
            group_by?: undefined;
            ids?: undefined;
            output_dir?: undefined;
            format?: undefined;
            manifest?: undefined;
        };
        required: string[];
    };
    annotations: {
        title: string;
        readOnlyHint: boolean;
        destructiveHint: boolean;
        idempotentHint: boolean;
        openWorldHint: boolean;
    };
})[];
export declare function handleToolCall(name: string, args: Record<string, unknown>): Promise<{
    content: ContentBlock[];
    isError?: boolean;
}>;
export {};
//# sourceMappingURL=tools.d.ts.map