/**
 * Created with IntelliJ IDEA.
 * User: zhengry
 * Date: 2014/11/6
 * Time: 15:48
 */

require.config({
    baseUrl: window.ctx + "/static/app",
    waitSeconds: 2000,
    paths: {
        "jquery": window.ctx + "/bower_components/jquery/dist/jquery.min",
        "angular": window.ctx + "/bower_components/angular/angular",
        "angular-route": window.ctx + "/bower_components/angular-route/angular-route.min",
        "angular-resource": window.ctx + "/bower_components/angular-resource/angular-resource",
        "angular-local-storage": window.ctx + "/bower_components/angular-local-storage/dist/angular-local-storage",
        "angular-base64": window.ctx + "/bower_components/angular-base64/angular-base64",
        "tooltipster": window.ctx + "/bower_components/tooltipster/js/jquery.tooltipster",
        "laydate": window.ctx + "/bower_components/laydate/laydate.dev",
        'angular-sanitize': window.ctx + "/bower_components/angular-sanitize/angular-sanitize",
        'ztree': window.ctx + "/bower_components/ztree_v3/js/jquery.ztree.core-3.5.min",
        'ztree_check': window.ctx + "/bower_components/ztree_v3/js/jquery.ztree.excheck-3.5.min",
        'underscore':window.ctx + "/bower_components/underscore/underscore",
        'angular-underscore':window.ctx + "/bower_components/angular-underscore/angular-underscore",
        'artTmpl': window.ctx + '/bower_components/artTemplate/dist/template-debug',
        'ngContextMenu': window.ctx + '/bower_components/context-menu/ng-context-menu',
        'Handsontable': window.ctx + '/bower_components/handsontable-pro/dist/handsontable.full',
        'angular-placeholder': window.ctx + '/bower_components/angular-placeholder/src/angularjs-placeholder',
        'vs':window.ctx+'/bower_components/monaco-editor/min/vs',
        "editor":window.ctx+'/bower_components/monaco-editor/min/vs/editor/editor.main',
        "editor-nls":window.ctx+'/bower_components/monaco-editor/min/vs/editor/editor.main.nls',
        "editor-loader":window.ctx+'/bower_components/monaco-editor/min/vs/loader'
    },
    shim: {
        "angular": {
            exports: "angular",
            deps: ["jquery"]
        },
        "editor":{
            deps:["editor-nls","editor-loader"]
        },
        "angular-underscore":{
            deps:["angular","underscore"]
        },
        "angular-resource": {
            deps: ["angular"]
        },
        "angular-route": {
            deps: ["angular"]
        },
        "angular-local-storage": {
            deps: ["angular"]
        },
        "angular-base64": {
            deps: ["angular"]
        },
        "tooltipster": {
            deps: ["jquery"]
        },
        "laydate": {
            exports: "laydate"
        },
        "angular-sanitize": {
            deps: ["angular"]
        },
        "ztree": {
            deps: ["jquery"]
        },
        "ztree_check": {
            deps: ["jquery", "ztree"]
        },
        'artTmpl': {
            exports: 'artTmpl'
        },
        'ngContextMenu': {
            deps: ["angular"]
        },
        'Handsontable': {
            deps: ["css!" + window.ctx + "/bower_components/handsontable-pro/dist/handsontable.full.css"]
        }
    },
    config: {
        i18n: {
            locale: localStorage.getItem('locale') || 'zh-cn'
        }
    },
    deps: ["dynamicBootstrap"]
});
