package com.company.projectmanagement.model;

/**
 * 依赖类型枚举
 */
public enum DependencyType {
    /**
     * 内部依赖
     * 项目内部团队或组件之间的依赖
     */
    INTERNAL("内部依赖"),
    
    /**
     * 外部依赖
     * 依赖于外部系统、第三方服务或其他项目
     */
    EXTERNAL("外部依赖"),
    
    /**
     * 完成到开始 (Finish-to-Start)
     * 前置任务必须完成后，后续任务才能开始
     */
    FINISH_TO_START("完成到开始"),

    /**
     * 开始到开始 (Start-to-Start)
     * 前置任务开始后，后续任务才能开始
     */
    START_TO_START("开始到开始"),

    /**
     * 完成到完成 (Finish-to-Finish)
     * 前置任务完成后，后续任务才能完成
     */
    FINISH_TO_FINISH("完成到完成"),

    /**
     * 开始到完成 (Start-to-Finish)
     * 前置任务开始后，后续任务才能完成
     */
    START_TO_FINISH("开始到完成");

    private final String description;

    DependencyType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
