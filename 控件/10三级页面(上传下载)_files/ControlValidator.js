define('framework/directive/ControlValidator', ['angular'], function () {

    /**
     * 同步验证匹配器
     *
     * @param validationParams {Object} 验证必要参数
     * @param validationParams.rule {Object} 验证规则
     * @param validationParams.rule.ruleName {String} 验证规则类型名称
     * @param [validationParams.rule.pattern] {String} 规则是 `pattern` 时,  本属性是正则字符串
     * @param [validationParams.rule.property] {String} 验证的字段名称
     * @param [validationParams.rule.listenProperties] {Array<String>} 监听的属性的名称
     * @param [validationParams.rule.combineName] {String} 组合名称
     * @param validationParams.form {Object} angular form对象
     * @Param validationParams.entityAndGroupName {String} 当前验证规则文件名的名称, 是 `实体名_分组名`
     * @constructor
     */
    return function ControlValidator(ruleValidator) {
        var me = this,
            gValidator = ruleValidator.gValidator,
            rule = me.rule = ruleValidator.rule,
            ruleName = me.ruleName = rule['ruleName'];
        me.gValidator = gValidator;
        me.$form = gValidator.$form;
        me.form = gValidator.form;
        me.property = rule.property;
        me.properties = rule.properties || [];
        me.entityName = gValidator.entityName;
        me.$outerContainerCache = {};
        me.$verifyTargetCache = {};
        me.$listenPropTargetCache = {};
    }
});