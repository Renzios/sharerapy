import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FileUpload from "../../../../components/forms/FileUpload";

describe("FileUpload component", () => {
  describe("Rendering", () => {
    it("renders instructions and default max size text", () => {
      render(<FileUpload onFileUpload={jest.fn()} />);

      expect(screen.getByText(/Drag a file here, or/i)).toBeInTheDocument();
      expect(screen.getByText(/Choose a file to upload/i)).toBeInTheDocument();
      // default maxSize is 10MB
      expect(screen.getByText(/PDF files only • Max 10MB/i)).toBeInTheDocument();
    });
  });

  describe("User Interaction", () => {
    it("calls onFileUpload when a PDF file is selected via the input", async () => {
      const mock = jest.fn();
      const { container } = render(<FileUpload onFileUpload={mock} />);

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      const file = new File(["dummy content"], "report.pdf", { type: "application/pdf" });

      // Use userEvent.upload to simulate file selection
      await userEvent.upload(input, file);

      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenCalledWith(expect.objectContaining({ name: "report.pdf" }));
    });

    it("shows a rejection message when uploaded file is over maxSize", async () => {
      // set maxSize to 1 byte so that even a small file gets rejected
      const { container } = render(<FileUpload onFileUpload={jest.fn()} maxSize={1} />);

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      const bigFile = new File(["0123456789"], "big.pdf", { type: "application/pdf" });


  // Use userEvent.upload to simulate selecting a file that's too large
  await userEvent.upload(input, bigFile);

      // react-dropzone will populate fileRejections; the component renders those error messages
      // Look for a message that indicates the file is too large — match common words to be resilient
      const rejection = await screen.findByText(/larger|exceed|size/i);
      expect(rejection).toBeInTheDocument();
    });
  });

  describe("Props Handling", () => {
    it("displays the provided maxSize in MB when a different maxSize prop is passed", () => {
      // 2MB = 2097152 bytes
      render(<FileUpload onFileUpload={jest.fn()} maxSize={2097152} />);

      expect(screen.getByText(/PDF files only • Max 2MB/i)).toBeInTheDocument();
    });

    it("applies width and className props to the root container", () => {
      const { container } = render(
        <FileUpload onFileUpload={jest.fn()} width="w-1/2" className="test-class" />
      );

      // container.firstChild is the top-level wrapper div
      const top = container.firstChild as HTMLElement;
      expect(top).toBeTruthy();
      expect(top.className).toContain("w-1/2");
      expect(top.className).toContain("test-class");
    });
  });
});
