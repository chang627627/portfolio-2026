import svgPaths from "./svg-f3k6wx540r";

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p2c2f98a0} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-gradient-to-b from-[#7c75ff] relative rounded-[1.67772e+07px] shrink-0 size-[30px] to-[#635bff]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[30px]">
        <Icon />
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#041c33] text-[16px] text-nowrap top-[-1px] whitespace-pre">Luna</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#304050] text-[14px] text-nowrap top-0 whitespace-pre">Your Coffee Chat Assistant</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="basis-0 grow h-[45px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[45px] items-start relative w-full">
        <Paragraph />
        <Paragraph1 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[45px] relative shrink-0 w-[220.82px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] h-[45px] items-center relative w-[220.82px]">
        <Container />
        <Container1 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute bg-[#f6f8fa] box-border content-stretch flex h-[69px] items-center left-px pb-px pl-[21px] pr-0 pt-0 rounded-tl-[8px] rounded-tr-[8px] top-px w-[406px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#d5dbe1] border-[0px_0px_1px] border-solid inset-0 pointer-events-none rounded-tl-[8px] rounded-tr-[8px]" />
      <Container2 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_5_4136)" id="Icon">
          <path d={svgPaths.p3f4a7a0} fill="var(--fill-0, #FF9900)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_5_4136">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[18px] relative shrink-0 w-[297.461px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[18px] relative w-[297.461px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#041c33] text-[14px] text-nowrap top-[0.5px] whitespace-pre">Please schedule this chat by Sunday, July 20</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[18px] relative shrink-0 w-[364px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] h-[18px] items-center relative w-[364px]">
        <Icon1 />
        <Paragraph2 />
      </div>
    </div>
  );
}

function AiAgent() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="AIAgent">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="AIAgent">
          <path d={svgPaths.p8c9ab00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-gradient-to-b from-[#7c75ff] relative rounded-[1.67772e+07px] shrink-0 size-[40px] to-[#635bff]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[40px]">
        <AiAgent />
      </div>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[40px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#041c33] text-[14px] top-[0.5px] w-[259px]">Hey Alex! Ready to meet someone new from Product Design this week?</p>
    </div>
  );
}

function ChatMessage() {
  return (
    <div className="basis-0 bg-[#f6f8fa] grow h-[66px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="ChatMessage">
      <div aria-hidden="true" className="absolute border border-[#d5dbe1] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[66px] items-start pb-px pt-[13px] px-[17px] relative w-full">
          <Paragraph3 />
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[66px] relative shrink-0 w-[364px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] h-[66px] items-start relative w-[364px]">
        <Container5 />
        <ChatMessage />
      </div>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[20px] relative shrink-0 w-[93.352px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[93.352px]">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[14px] text-nowrap text-white top-[0.5px] whitespace-pre">Sounds great!</p>
      </div>
    </div>
  );
}

function QuickReplies() {
  return (
    <div className="bg-[#635bff] h-[32px] relative rounded-[4px] shrink-0 w-[364px]" data-name="QuickReplies">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[32px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[364px]">
        <Paragraph4 />
      </div>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[20px] relative shrink-0 w-[79.078px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[79.078px]">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#8792a2] text-[14px] text-nowrap top-[0.5px] whitespace-pre">Maybe later</p>
      </div>
    </div>
  );
}

function QuickReplies1() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[4px] shrink-0 w-[364px]" data-name="QuickReplies">
      <div aria-hidden="true" className="absolute border border-[#d5dbe1] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-full items-center justify-center p-px relative w-[364px]">
        <Paragraph5 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[364px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[12px] h-full items-start relative w-[364px]">
        <QuickReplies />
        <QuickReplies1 />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[208px] items-start left-[22px] top-[91px] w-[364px]" data-name="Container">
      <Container4 />
      <Container6 />
      <Container7 />
    </div>
  );
}

export default function ChatWindow() {
  return (
    <div className="bg-white relative rounded-[8px] size-full" data-name="ChatWindow">
      <div aria-hidden="true" className="absolute border border-[#d5dbe1] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Container3 />
      <Container8 />
    </div>
  );
}