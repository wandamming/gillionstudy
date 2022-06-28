window.__qx_ctx = '/gschool';
define({
    dict_config: {
        method:"get",
        url:"/html/contents/widget/dict/dict.json"
    },
    $window_$config: {
        ctx: '',
        path: '',
        locale: 'zh-cn'
    },
    stopRepeatUrlPatterns: [
        '/'
    ],
    html: {
         //input: {
         //     gDbc: false
         //}
    },
    controls: {
        associate: {
            //preventTabindex: true,
            //showEvent: 'dblclick'
        },
        dropdown: {
            associateType: "selectFirst",
            showEvent: "click",
            //displayCode:"-",
            lazyRenderDropItems: 'readonly' //  none - 默认值，不延迟渲染下拉列表   all - 延迟渲染所有下拉列表   readonly - 延迟渲染只读或禁
        },
        dataGrid: {
            disableCopyEditing: true,
            validation: {
                requireDisabled: false
            },
            keydownNewRow: false
        },
         $prepareLoadModules: [window.__qx_ctx + '/areas/allAreas'],
         areas: {
         codeFormatter: 'kxtx',
         areasJsFilePath: window.__qx_ctx + '/areas/allAreas',
         searchingUrl: window.__qx_ctx + '/areas/search'
         },
        uploader: {
            showDeleter: 'always',
            urls: {
                uploadPrefix: '/cloud/filesystem/uploadFile/',
                downloadPrefix: '/cloud/filesystem/downloadFile/',
                deletePrefix: '/cloud/filesystem/deleteFile/',
                getStrategyPrefix: '/cloud/filesystem/getStrategy/',
                getFileInfosByStrategyId: '/cloud/filesystem/getFileInfos/',
                getSnapshotUploadPrefix:'/cloud/filesystem/uploadSnapshot/'
            },
            unknownClass: 'fi-file-rar',
            previewClassExtMap: {
                'fi-file-word': ['docx', 'dotx', 'doc', 'dot', 'docm', 'xps', 'rtf', 'wtf', 'odt'],
                'fi-file-pdf': ['pdf'],
                'fi-file-excel': ['xlsx', 'xlsm', 'xlsb', 'xltx', 'xltm', 'xls', 'xlt', 'xls', 'xml', 'xlam', 'xla', 'xlw', 'csv'],
                'fi-file-ppt': ['pptx', 'pptm', 'ppt', 'xps', 'potx', 'potm', 'pot', 'thmx', 'pps', 'ppsm', 'ppam', 'ppa'],
                'fi-file-rar': ['rar', 'zip', 'zz', 'zix', 'zipx', 'z', 'yz', 'war', 'tgz', 'rpm', 'rz', 'jar', 'gzip']
            }
        },
        pauseClick:{
            pauseTime:5000
        },
        uniqueSync: true,
        repeatRequestInterceptor: {
            /**
             * @cfg title {String}
             * @cfg message {String}
             */
            repeatMsgOptions: {
                title: '错误',
                message: '请不要重复提交'
            },
            sessionUserIdProp: '$sessionAttrs.loginUser.userId',
            handleUrlPatterns: ['/gschool/system/employees/*']
        },
        validation: {
            fieldErrorsTransformer: undefined,
            chineseWidth: 3,
            verifyOnSubmit:true
        },
        date: {
            showOnFocus: false,
            formatMode: "focus"
        },
        time:{
            showOnFocus:false,
            showOnClickInput: true
        },
        handsontable: {
            filters_width: 100,
            filters_height: 100,
            showWaitingModal: true
        },
        datasource: {
            method: 'get',       //get或post
            paramParser: 'form'  //form或json
        }
    },
    $paths: {
        $current: {
            ctx: '/gschool',
            path: ''
        },
        tms: {
            ctx: 'http://tms.kxtx.cn/kxtx-tms',
            path: 'http://tms.kxtx.cn'
        },
        oms: {
            ctx: 'http://oms.kxtx.cn/kxtx-oms',
            path: 'http://oms.kxtx.cn'
        },
        crm: {
            ctx: 'http://crm.kxtx.cn/kxtx-crm',
            path: 'http://crm.kxtx.cn'
        },
        wms: {
            ctx: 'http://wms.kxtx.cn/kxtx-wms',
            path: 'http://wms.kxtx.cn'
        }
    }
});