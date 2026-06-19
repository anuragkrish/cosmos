#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to validate application name
validate_app_name() {
    local name="$1"

    # Check if name is empty
    if [[ -z "$name" ]]; then
        print_error "Application name cannot be empty"
        return 1
    fi

    # Check if name contains only valid characters (lowercase letters, numbers, hyphens)
    if [[ ! "$name" =~ ^[a-z0-9-]+$ ]]; then
        print_error "Application name must contain only lowercase letters, numbers, and hyphens"
        return 1
    fi

    # Check if name starts or ends with hyphen
    if [[ "$name" =~ ^- ]] || [[ "$name" =~ -$ ]]; then
        print_error "Application name cannot start or end with a hyphen"
        return 1
    fi

    # Check length (reasonable limits for container names)
    if [[ ${#name} -lt 3 ]] || [[ ${#name} -gt 50 ]]; then
        print_error "Application name must be between 3 and 50 characters"
        return 1
    fi

    return 0
}

# Function to backup files
backup_files() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_dir="backup_$timestamp"  # Make this global so we can access it later

    print_info "Creating backup directory: $backup_dir"
    mkdir -p "$backup_dir"

    if [[ -f "package.json" ]]; then
        cp "package.json" "$backup_dir/package.json"
        print_info "Backed up package.json"
    fi

    if [[ -f ".github-temp/workflows/build.yml" ]]; then
        cp ".github-temp/workflows/build.yml" "$backup_dir/build.yml"
        print_info "Backed up build.yml"
    fi

    print_success "Backup completed in $backup_dir"
}

# Function to cleanup backup
cleanup_backup() {
    if [[ -n "$backup_dir" ]] && [[ -d "$backup_dir" ]]; then
        echo ""
        read -p "Would you like to delete the backup folder ($backup_dir)? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$backup_dir"
            print_success "Backup folder deleted"
        else
            print_info "Backup folder preserved at: $backup_dir"
        fi
    fi
}

# Function to replace application name in files
replace_in_file() {
    local file_path="$1"
    local app_name="$2"

    if [[ ! -f "$file_path" ]]; then
        print_warning "File not found: $file_path"
        return 1
    fi

    print_info "Updating $file_path"

    # Use sed with backup and cross-platform compatibility
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/<APPLICATION_NAME>/$app_name/g" "$file_path"
    else
        # Linux
        sed -i "s/<APPLICATION_NAME>/$app_name/g" "$file_path"
    fi

    # Verify replacement was successful
    if grep -q "<APPLICATION_NAME>" "$file_path"; then
        print_warning "Some <APPLICATION_NAME> placeholders may still remain in $file_path"
        return 1
    fi

    print_success "Successfully updated $file_path"
    return 0
}

# Function to show preview of changes
show_preview() {
    local app_name="$1"

    echo ""
    print_info "Preview of changes to be made:"
    echo ""

    if [[ -f "package.json" ]]; then
        echo "📄 package.json:"
        grep -n "APPLICATION_NAME" "package.json" 2>/dev/null | sed "s/<APPLICATION_NAME>/$app_name/g" || print_warning "No <APPLICATION_NAME> found in package.json"
    fi

    if [[ -f ".github-temp/workflows/build.yml" ]]; then
        echo ""
        echo "📄 .github-temp/workflows/build.yml:"
        grep -n "APPLICATION_NAME" ".github-temp/workflows/build.yml" 2>/dev/null | sed "s/<APPLICATION_NAME>/$app_name/g" || print_warning "No <APPLICATION_NAME> found in build.yml"
    fi

    if [[ -d ".github-temp" ]]; then
        echo ""
        echo "📁 .github-temp/ folder will be renamed to .github/"
    fi

    echo ""
}

# Function to show preview of changes for standalone repos
show_preview_standalone() {
    local app_name="$1"

    echo ""
    print_info "Preview of changes to be made:"
    echo ""

    if [[ -f "package.json" ]]; then
        echo "📄 package.json:"
        grep -n "APPLICATION_NAME" "package.json" 2>/dev/null | sed "s/<APPLICATION_NAME>/$app_name/g" || print_warning "No <APPLICATION_NAME> found in package.json"
    fi

    if [[ -d ".github-temp" ]]; then
        echo ""
        echo "🗑️  .github-temp/ folder will be deleted (Headout-specific workflows)"
    fi

    echo ""
}

# Function to rename .github-temp to .github for Headout repos
rename_github_folder() {
    if [[ -d ".github-temp" ]]; then
        print_info "Renaming .github-temp to .github..."
        if [[ -d ".github" ]]; then
            print_warning "Existing .github folder found, removing it first..."
            rm -rf ".github"
        fi
        mv ".github-temp" ".github"
        print_success "GitHub workflows activated"
        return 0
    else
        print_warning ".github-temp folder not found"
        return 1
    fi
}

# Function to remove GitHub workflows
remove_github_folder() {
    if [[ -d ".github-temp" ]]; then
        print_info "Removing .github-temp folder..."
        rm -rf ".github-temp"
        print_success "GitHub workflows removed"
        return 0
    else
        print_warning ".github-temp folder not found"
        return 1
    fi
}

# Function to check if NVM is installed
check_nvm_installed() {
    if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
        return 0
    elif command -v nvm &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to install NVM
install_nvm() {
    print_info "Installing NVM (Node Version Manager)..."

    # Download and install NVM
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

    # Source NVM immediately
    export NVM_DIR="$HOME/.nvm"
    [[ -s "$NVM_DIR/nvm.sh" ]] && \. "$NVM_DIR/nvm.sh"
    [[ -s "$NVM_DIR/bash_completion" ]] && \. "$NVM_DIR/bash_completion"

    if check_nvm_installed; then
        print_success "NVM installed successfully"
        return 0
    else
        print_error "Failed to install NVM"
        return 1
    fi
}

# Function to configure Oak MCP
configure_oak_mcp() {
    echo ""
    read -p "Would you like to enable Oak MCP? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        read -p "Enter your Oak MCP token: " oak_token

        if [[ -z "$oak_token" ]]; then
            print_error "Token cannot be empty"
            return 1
        fi

        print_info "Configuring Oak MCP with provided token..."

        # Update .cursor/mcp.json
        if [[ -f ".cursor/mcp.json" ]]; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/<token>/$oak_token/g" ".cursor/mcp.json"
            else
                sed -i "s/<token>/$oak_token/g" ".cursor/mcp.json"
            fi
            print_success "Updated .cursor/mcp.json"
        else
            print_warning ".cursor/mcp.json not found"
        fi

        # Update .mcp.json
        if [[ -f ".mcp.json" ]]; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/<token>/$oak_token/g" ".mcp.json"
            else
                sed -i "s/<token>/$oak_token/g" ".mcp.json"
            fi
            print_success "Updated .mcp.json"
        else
            print_warning ".mcp.json not found"
        fi

        print_success "Oak MCP configured successfully"
        return 0
    else
        print_info "Removing MCP configuration files..."

        # Remove .cursor/mcp.json
        if [[ -f ".cursor/mcp.json" ]]; then
            rm ".cursor/mcp.json"
            print_success "Removed .cursor/mcp.json"
        fi

        # Remove .mcp.json
        if [[ -f ".mcp.json" ]]; then
            rm ".mcp.json"
            print_success "Removed .mcp.json"
        fi

        print_info "Oak MCP disabled"
        return 0
    fi
}

# Function to configure SDD
configure_sdd() {
    echo ""
    read -p "Would you like to use Specification-Driven Development (SDD)? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Configuring SDD..."

        # Copy SDD versions to active files
        if [[ -f "agents-sdd.md" ]]; then
            cp "agents-sdd.md" "AGENTS.md"
            print_success "Activated AGENTS.md with SDD"
        fi

        if [[ -f "claude-sdd.md" ]]; then
            cp "claude-sdd.md" "CLAUDE.md"
            print_success "Activated CLAUDE.md with SDD"
        fi

        # Remove all template files (both SDD and non-SDD versions)
        rm -f "agents-sdd.md" "claude-sdd.md" "agents-no-sdd.md" "claude-no-sdd.md"
        print_info "Removed template files"

        print_success "SDD enabled"
        print_info "SDD commands available: pnpm sdd:new, pnpm sdd:plan"
        return 0
    else
        print_info "Configuring without SDD..."

        # Copy non-SDD versions to active files
        if [[ -f "agents-no-sdd.md" ]]; then
            cp "agents-no-sdd.md" "AGENTS.md"
            print_success "Activated AGENTS.md without SDD"
        fi

        if [[ -f "claude-no-sdd.md" ]]; then
            cp "claude-no-sdd.md" "CLAUDE.md"
            print_success "Activated CLAUDE.md without SDD"
        fi

        # Remove all template files (both SDD and non-SDD versions)
        rm -f "agents-sdd.md" "claude-sdd.md" "agents-no-sdd.md" "claude-no-sdd.md"
        print_info "Removed template files"

        # Remove .sdd directory
        if [[ -d ".sdd" ]]; then
            rm -rf ".sdd"
            print_success "Removed .sdd/ directory"
        fi

        # Remove SDD scripts from package.json
        if [[ -f "package.json" ]]; then
            print_info "Removing SDD scripts from package.json..."

            # Create a temporary file
            local temp_file=$(mktemp)

            # Remove sdd:new and sdd:plan lines
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed '/[[:space:]]*"sdd:new":/d' package.json | sed '/[[:space:]]*"sdd:plan":/d' > "$temp_file"
            else
                sed '/[[:space:]]*"sdd:new":/d' package.json | sed '/[[:space:]]*"sdd:plan":/d' > "$temp_file"
            fi

            # Replace original file
            mv "$temp_file" package.json
            print_success "Removed SDD scripts from package.json"
        fi

        print_success "SDD disabled"
        return 0
    fi
}

# Function to setup Node.js and PNPM
setup_node_environment() {
    print_info "Setting up Node.js and PNPM environment..."

    # Check if NVM is installed
    if ! check_nvm_installed; then
        print_warning "NVM not found. Installing NVM..."
        if ! install_nvm; then
            print_error "Failed to install NVM. Please install it manually and re-run the script."
            return 1
        fi
    else
        print_success "NVM is already installed"
    fi

    # Source NVM
    export NVM_DIR="$HOME/.nvm"
    [[ -s "$NVM_DIR/nvm.sh" ]] && \. "$NVM_DIR/nvm.sh"
    [[ -s "$NVM_DIR/bash_completion" ]] && \. "$NVM_DIR/bash_completion"

    # Extract required Node version from package.json (>=22 -> 22)
    local required_node_version="22"

    print_info "Installing Node.js version $required_node_version..."
    nvm install $required_node_version
    nvm use $required_node_version

    # Verify Node installation
    local current_node_version=$(node --version 2>/dev/null || echo "none")
    print_success "Node.js version: $current_node_version"

    # Check if PNPM is installed
    if ! command -v pnpm &> /dev/null; then
        print_info "Installing PNPM..."
        npm install -g pnpm@9.12.1
    else
        local current_pnpm_version=$(pnpm --version 2>/dev/null || echo "unknown")
        print_info "Current PNPM version: $current_pnpm_version"

        # Check if we need to update PNPM
        if [[ "$current_pnpm_version" < "9" ]]; then
            print_info "Updating PNPM to version 9.12.1..."
            npm install -g pnpm@9.12.1
        fi
    fi

    # Verify PNPM installation
    local final_pnpm_version=$(pnpm --version 2>/dev/null || echo "none")
    print_success "PNPM version: $final_pnpm_version"

    # Verify versions meet requirements
    local node_major=$(echo "$current_node_version" | sed 's/v\([0-9]*\).*/\1/')
    local pnpm_major=$(echo "$final_pnpm_version" | sed 's/\([0-9]*\).*/\1/')

    if [[ $node_major -ge 22 ]] && [[ $pnpm_major -ge 9 ]]; then
        print_success "Environment setup completed successfully"
        echo ""
        print_info "Versions installed:"
        echo "  • Node.js: $current_node_version (required: >=22)"
        echo "  • PNPM: $final_pnpm_version (required: >=9)"
        echo ""
        return 0
    else
        print_error "Environment setup failed to meet requirements"
        return 1
    fi
}

# Main script
main() {
    print_info "🚀 Headout Application Template Initializer"
    echo ""

    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        print_error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi

    # Setup Node.js and PNPM environment first
    if ! setup_node_environment; then
        print_error "Failed to setup Node.js environment. Please install manually and re-run the script."
        exit 1
    fi

    # Configure Oak MCP
    configure_oak_mcp

    # Configure SDD
    configure_sdd

    # Check if placeholders exist
    local has_placeholders=false
    if grep -q "<APPLICATION_NAME>" "package.json" 2>/dev/null; then
        has_placeholders=true
    fi
    if grep -q "<APPLICATION_NAME>" ".github-temp/workflows/build.yml" 2>/dev/null; then
        has_placeholders=true
    fi

    if [[ "$has_placeholders" != "true" ]]; then
        print_warning "No <APPLICATION_NAME> placeholders found. Application may already be initialized."
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Initialization cancelled."
            exit 0
        fi
    fi

    # Get application name from user
    while true; do
        echo ""
        read -p "Enter your application name (e.g., my-awesome-app): " app_name

        if validate_app_name "$app_name"; then
            break
        fi
        echo ""
        print_info "Please try again with a valid application name."
    done

    # Ask about Headout scope
    echo ""
    read -p "Is this a Headout-scoped repository? (y/N): " -n 1 -r
    echo
    local is_headout_scoped=false
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        is_headout_scoped=true
        print_info "Repository will be configured for Headout deployment pipeline"
    else
        is_headout_scoped=false
        print_warning "Repository will be configured as standalone (GitHub workflows will be removed)"
    fi

    # Show preview based on scope
    if [[ "$is_headout_scoped" == "true" ]]; then
        show_preview "$app_name"
    else
        show_preview_standalone "$app_name"
    fi

    # Confirm with user
    echo ""
    read -p "Proceed with these changes? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Initialization cancelled."
        exit 0
    fi

    # Create backup
    backup_files

    # Perform replacements
    echo ""
    print_info "Updating application files..."

    local success=true

    # Replace in package.json
    if ! replace_in_file "package.json" "$app_name"; then
        success=false
    fi

    # Handle GitHub workflows based on scope
    if [[ "$is_headout_scoped" == "true" ]]; then
        # Replace in GitHub workflow template for Headout repos
        if ! replace_in_file ".github-temp/workflows/build.yml" "$app_name"; then
            success=false
        fi
        # Rename .github-temp to .github
        rename_github_folder
    else
        # Remove GitHub folder for standalone repos
        remove_github_folder
    fi

    echo ""
    if [[ "$success" == "true" ]]; then
        print_success "🎉 Application successfully initialized as '$app_name'"
        echo ""
        print_info "Installing dependencies..."
        pnpm install

        echo ""
        print_info "Next steps:"
        echo "  1. Run 'pnpm dev' to start development server"
        echo "  2. Update README.md with your application details"
        echo "  3. Start building your application!"
        echo ""
        print_info "Files updated:"
        echo "  • package.json"
        if [[ "$is_headout_scoped" == "true" ]]; then
            echo "  • .github/workflows/build.yml"
        else
            echo "  • .github-temp/ folder removed (standalone repository)"
        fi

        # Ask about backup cleanup
        cleanup_backup
    else
        print_error "Some errors occurred during initialization. Please check the files manually."
        exit 1
    fi
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
