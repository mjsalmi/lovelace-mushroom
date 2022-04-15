import { computeRTL, HomeAssistant } from "custom-card-helpers";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { isAvailable } from "../../../ha/data/entity";
import { LockEntity } from "../../../ha/data/lock";
import { isActionPending, isLocked, isUnlocked } from "../utils";

interface LockButton {
    icon: string;
    serviceName?: string;
    isVisible: (entity: LockEntity) => boolean;
    isDisabled: (entity: LockEntity) => boolean;
}

export const LOCK_BUTTONS: LockButton[] = [
    {
        icon: "mdi:lock",
        serviceName: "lock",
        isVisible: (entity) => isUnlocked(entity),
        isDisabled: () => false,
    },
    {
        icon: "mdi:lock-open",
        serviceName: "unlock",
        isVisible: (entity) => isLocked(entity),
        isDisabled: () => false,
    },
    {
        icon: "mdi:lock-clock",
        isVisible: (entity) => isActionPending(entity),
        isDisabled: () => true,
    },
];

@customElement("mushroom-lock-buttons-control")
export class LockButtonsControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: LockEntity;

    @property() public fill: boolean = false;

    private callService(e: CustomEvent) {
        e.stopPropagation();
        const entry = (e.target! as any).entry as LockButton;
        this.hass.callService("lock", entry.serviceName!, {
            entity_id: this.entity!.entity_id,
        });
    }

    protected render(): TemplateResult {
        const rtl = computeRTL(this.hass);

        return html`
            <mushroom-button-group .fill=${this.fill} .?rtl=${rtl}
                >${LOCK_BUTTONS.filter((item) => item.isVisible(this.entity)).map(
                    (item) => html`
                        <mushroom-button
                            .icon=${item.icon}
                            .entry=${item}
                            .disabled=${!isAvailable(this.entity) || item.isDisabled(this.entity)}
                            @click=${this.callService}
                        ></mushroom-button>
                    `
                )}</mushroom-button-group
            >
        `;
    }
}