---
name: "feedback-handler"
description: "Automatically handles user feedback (optimization requirements and BUG reports). Invoke when user submits optimization requests or bug reports."
---

# User Feedback Handler

This skill automatically processes user feedback issues including optimization requirements and bug reports.

## Mandatory Execution Constraints

**STRICT REQUIREMENT: You MUST follow each step exactly as described below. Deviation is not allowed. Failure to follow will be considered a critical error.**

1. You MUST mark the current step as `in_progress` using TodoWrite tool before starting it
2. You MUST complete the step and generate visible output/result
3. You MUST mark the step as `completed` before proceeding to the next step
4. You MUST display the current TodoWrite status after each step completion

**ABSOLUTE RULE: If any step cannot be completed, you MUST:**
- Report the specific issue immediately
- Provide remaining tasks as new todos
- Stop all further execution and ask user for guidance
- NEVER attempt to guess or fabricate results to skip the blocked step

**DO NOT skip any steps. NEVER bypass or merge steps. DO NOT provide final results before completing all steps 1-6.**

**NEVER reach Step 7 without completing Steps 1-6 in order. Both options at Step 7 MUST always be presented to the user. Never make assumptions about which option the user will choose.**

**CONSEQUENCE: If you skip steps or provide results before completing required steps, the user will detect this and report the violation. You MUST maintain transparency at all times.**

## Execution Flow

### Step 1: Read Development Task Document
[ ] Mark as `in_progress` | Read the main development task document (xx.md) to understand current development context and objectives.
[ ] Mark as `completed` | **Output**: Brief summary of development task

### Step 2: Match Development Requirements
[ ] Mark as `in_progress` | Based on the task information obtained, precisely match and retrieve specific development requirement details using "Task Name".
[ ] Mark as `completed` | **Output**: Matched requirement details with file references

### Step 3: Analyze Code Differences
[ ] Mark as `in_progress` | Analyze code differences between the current working Git branch and the main branch to identify relevant files and functional modules.
[ ] Mark as `completed` | **Output**: List of changed files and affected modules

### Step 4: Requirement Analysis and Plan Design
[ ] Mark as `in_progress` | Comprehensive analysis of all gathered information to form a detailed implementation plan.
[ ] Mark as `completed` | **Output**: Detailed implementation plan with numbered tasks

### Step 5: Code Implementation
[ ] Mark as `in_progress` | Execute the planned code implementation and functional development.
[ ] Mark as `completed` | **Output**: List of implemented changes with file paths

### Step 6: Code Review
[ ] Mark as `in_progress` | Conduct comprehensive review of completed code including:
- Function completeness
- Code quality
- Performance impact
- Compatibility check
[ ] Mark as `completed` | **Output**: Review report with pass/fail status for each category

### Step 7: Completion Options
[ ] Mark as `in_progress` | After completing Step 6, you MUST use AskUserQuestion tool to present both options to the user:
[ ] Mark as `completed` | **Output**: Wait for user to select one of two options via Trae option interface:

**Option 1**: Wait to process next optimization requirement or bug report

**Option 2**: Confirm all issues are resolved and hand over the task to the documentation skill

**AskUserQuestion options format (MUST use this exact format):**
```
options: [
  { label: "1. Wait", description: "继续等待处理下一个优化需求或BUG报告" },
  { label: "2. Confirm Done", description: "确认所有问题已修复完成，将任务移交给documentation技能" }
]
```

**You MUST use AskUserQuestion tool with exactly this options format. Do not present options as plain text. Do not proceed until user makes a selection via Trae option.**

## Input Requirements

When triggering this skill, provide:
- Task name or issue description
- Category (optimization requirement / bug report)
- Relevant file paths or modules (if applicable)

## Output

The skill will deliver:
- Analysis report
- Implementation plan
- Completed code changes
- Review results
- Final options for continuation